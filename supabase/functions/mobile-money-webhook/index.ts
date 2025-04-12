
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { crypto } from "https://deno.land/std@0.140.0/crypto/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

// Transaction verification functions
async function verifyWithdrawalLimit(userId: string, amount: number, provider: string): Promise<{ allowed: boolean; reason?: string; dailyTotal: number; userLimit: number }> {
  console.log(`Verifying withdrawal limit for user ${userId}, amount ${amount}, provider ${provider}`);
  
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  // Get last 24h transactions
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  
  const { data: transactions, error: transactionsError } = await supabase
    .from("transactions")
    .select("amount")
    .eq("user_id", userId)
    .eq("type", `Paiement ${provider}`)
    .gte("created_at", yesterday.toISOString());
    
  if (transactionsError) {
    console.error("Error fetching transactions:", transactionsError);
    return { allowed: false, reason: "Erreur de vérification de limite", dailyTotal: 0, userLimit: 0 };
  }
  
  // Calculate daily total
  const dailyTotal = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
  
  // Get user limit
  const { data: userSettings, error: settingsError } = await supabase
    .from("user_settings")
    .select("daily_limit")
    .eq("user_id", userId)
    .single();
    
  // Default limit if not set
  const userLimit = userSettings?.daily_limit || 500000; // 500,000 FCFA default
  
  if (dailyTotal + amount > userLimit) {
    return { 
      allowed: false, 
      reason: "Plafond journalier dépassé", 
      dailyTotal, 
      userLimit 
    };
  }
  
  return { allowed: true, dailyTotal, userLimit };
}

// Security functions
async function verifySignature(payload: any, signature: string, provider: string): Promise<boolean> {
  // Get provider settings
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  const { data: providerSettings, error: settingsError } = await supabase
    .from("mobile_money_settings")
    .select("webhook_secret")
    .eq("provider", provider)
    .single();
  
  if (settingsError || !providerSettings) {
    console.error("Error fetching provider settings:", settingsError);
    return false;
  }
  
  const secretKey = providerSettings.webhook_secret;
  
  if (!secretKey) {
    console.error("No webhook secret found for provider:", provider);
    return false;
  }
  
  if (provider === 'orange_money') {
    // Orange uses certificate-based verification
    // In a real implementation, this would validate using a certificate
    return true; // Simplified for example
  } else if (provider === 'mtn_mobile') {
    // MTN uses HMAC-SHA256
    const message = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(message)
    );
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return calculatedSignature === signature;
  } else {
    // Generic HMAC-SHA256 verification
    const message = JSON.stringify(payload);
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secretKey),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(message)
    );
    
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const calculatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return calculatedSignature === signature;
  }
}

async function recordWebhook(payload: any, signature: string, isVerified: boolean): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseServiceKey);
  
  try {
    const { data, error } = await supabase
      .from("mobile_money_webhooks")
      .insert({
        reference_id: payload.transactionId || payload.paymentId,
        provider: payload.provider,
        transaction_type: payload.type || "payment",
        amount: payload.amount,
        phone_number: payload.phoneNumber,
        user_id: payload.userId,
        status: "pending",
        raw_payload: payload,
        signature: signature,
        is_verified: isVerified
      })
      .select()
      .single();
    
    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error("Error recording webhook:", error);
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    // Parse the webhook payload
    const payload = await req.json();
    console.log("Received Mobile Money webhook:", payload);

    // Extract security headers
    const signature = req.headers.get("x-signature") || "";
    const provider = payload.provider || "mtn_mobile"; // Default to MTN if not specified
    
    // Verify signature based on provider
    const isValidSignature = await verifySignature(payload, signature, provider);
    
    // Record the webhook even if signature is invalid (for security analysis)
    const webhookId = await recordWebhook(payload, signature, isValidSignature);
    
    if (!isValidSignature) {
      console.error("Invalid signature for provider:", provider);
      return new Response(
        JSON.stringify({ 
          error: "Invalid signature", 
          webhookId: webhookId,
          success: false 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Create a Supabase client with the service role key (for admin access)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract data from the webhook payload
    const { 
      paymentId, 
      transactionId, 
      status, 
      amount, 
      currency, 
      loanId, 
      userId,
      phoneNumber,
      secondAuthFactor
    } = payload;

    if (!paymentId || !status || !userId) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required fields", 
          webhookId: webhookId,
          success: false 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }
    
    // Verify second authentication factor (if provided)
    if (secondAuthFactor) {
      // In a real implementation, you would validate the second factor against
      // a previously stored value or one-time code. This is simplified.
      console.log("Second auth factor provided:", secondAuthFactor);
    }
    
    // Check withdrawal limit
    const limitCheck = await verifyWithdrawalLimit(userId, amount, provider);
    if (!limitCheck.allowed) {
      console.warn(`Payment rejected: ${limitCheck.reason}`);
      
      // Update the webhook status
      await supabase
        .from("mobile_money_webhooks")
        .update({
          status: "failed",
          processed_at: new Date().toISOString(),
          raw_payload: { 
            ...payload, 
            failure_reason: limitCheck.reason,
            daily_usage: {
              used: limitCheck.dailyTotal,
              limit: limitCheck.userLimit,
              remaining: limitCheck.userLimit - limitCheck.dailyTotal
            }
          }
        })
        .eq("id", webhookId);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: limitCheck.reason,
          webhookId: webhookId,
          dailyUsage: {
            used: limitCheck.dailyTotal,
            limit: limitCheck.userLimit,
            remaining: limitCheck.userLimit - limitCheck.dailyTotal
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Record the payment if status is successful
    if (status === "SUCCESSFUL") {
      // Update loan status in the database
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: amount,
          name: loanId ? "Remboursement prêt" : "Dépôt mobile money",
          type: `Paiement ${provider}`,
          reference: transactionId || paymentId
        });

      if (error) {
        console.error("Error recording payment:", error);
        throw error;
      }
      
      // Update the webhook status
      await supabase
        .from("mobile_money_webhooks")
        .update({
          status: "processed",
          processed_at: new Date().toISOString(),
          account_id: data?.[0]?.id
        })
        .eq("id", webhookId);

      // Broadcast the transaction status update using Supabase Realtime
      const broadcastResult = await supabase
        .channel('payment-updates')
        .send({
          type: 'broadcast',
          event: 'payment_processed',
          payload: {
            userId: userId,
            amount: amount,
            provider: provider,
            transactionId: transactionId || paymentId,
            webhookId: webhookId,
            timestamp: new Date().toISOString()
          }
        });

      console.log("Broadcast result:", broadcastResult);

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Payment recorded successfully",
          transactionId: transactionId || paymentId,
          webhookId: webhookId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.warn(`Payment not successful, status: ${status}`);
      
      // Update the webhook status
      await supabase
        .from("mobile_money_webhooks")
        .update({
          status: "failed",
          processed_at: new Date().toISOString(),
          raw_payload: { ...payload, failure_reason: `Payment status: ${status}` }
        })
        .eq("id", webhookId);
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Payment not successful, status: ${status}`,
          webhookId: webhookId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Error processing webhook:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
