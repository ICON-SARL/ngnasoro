
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

interface MobileMoneyRequest {
  userId: string;
  phoneNumber: string;
  amount: number;
  provider: "orange" | "mtn" | "wave";
  isWithdrawal: boolean;
}

interface QRCodeRequest {
  userId: string;
  amount: number;
  isWithdrawal: boolean;
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
    // Parse the request payload
    const payload = await req.json();
    console.log("Received payload:", payload);

    // Create a Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if user exists
    const { data: user, error: userError } = await supabase.auth.admin.getUserById(
      payload.userId
    );

    if (userError || !user) {
      console.error("User error:", userError);
      return new Response(
        JSON.stringify({ error: "User authentication failed" }),
        { 
          status: 401, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Handle Mobile Money request
    if (payload.action === "mobileMoney") {
      const { userId, phoneNumber, amount, provider, isWithdrawal } = payload as MobileMoneyRequest;
      
      // Validate phone number (basic validation)
      if (!phoneNumber || !phoneNumber.match(/^\+?[0-9]{10,15}$/)) {
        return new Response(
          JSON.stringify({ error: "Invalid phone number format" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Validate amount
      if (!amount || amount <= 0) {
        return new Response(
          JSON.stringify({ error: "Invalid amount" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Validate provider
      if (!["orange", "mtn", "wave"].includes(provider)) {
        return new Response(
          JSON.stringify({ error: "Invalid provider" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // In a real implementation, we would initiate a mobile money transaction
      // For now, we'll simulate by recording the request
      
      const transactionType = isWithdrawal ? "withdrawal" : "payment";
      
      // Record the transaction in the database
      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          name: `${provider.toUpperCase()} Mobile Money ${isWithdrawal ? "Retrait" : "Paiement"}`,
          amount: isWithdrawal ? -amount : -amount,
          type: isWithdrawal ? "withdrawal" : "payment",
          payment_method: "mobile_money",
          description: `Mobile Money ${isWithdrawal ? "Retrait" : "Paiement"} via ${provider.toUpperCase()}`,
          status: "success",
        })
        .select("*");
        
      if (transactionError) {
        console.error("Transaction error:", transactionError);
        return new Response(
          JSON.stringify({ success: false, error: transactionError.message }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Record in audit logs
      await supabase.from("audit_logs").insert({
        user_id: userId,
        action: `mobile_money_${transactionType}`,
        category: "payment",
        status: "success",
        details: {
          provider,
          phone_number: phoneNumber,
          amount,
          transaction_id: transaction ? transaction[0].id : null,
        },
      });
        
      return new Response(
        JSON.stringify({
          success: true,
          message: isWithdrawal 
            ? "Retrait Mobile Money initié avec succès"
            : "Paiement Mobile Money initié avec succès",
          transaction: transaction ? transaction[0] : null,
          reference: `MM-${Date.now().toString(36)}`,
          providerResponse: {
            status: "pending",
            providerReference: `${provider.toUpperCase()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
            estimatedCompletion: new Date(Date.now() + 60000).toISOString(),
          },
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // Handle QR Code request
    if (payload.action === "qrCode") {
      const { userId, amount, isWithdrawal } = payload as QRCodeRequest;
      
      // Generate a unique QR code
      const code = `QR-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      const expiresAt = new Date(Date.now() + 30 * 60000).toISOString(); // 30 minutes expiration
      
      // In a real implementation, we would store the QR code in the database
      // For demo purposes we're just returning it
      
      return new Response(
        JSON.stringify({
          success: true,
          qrCode: {
            userId,
            amount,
            isWithdrawal,
            timestamp: Date.now(),
            expiresAt,
            code,
          },
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
    
    // If no valid action was specified
    return new Response(
      JSON.stringify({ success: false, error: "Invalid action specified" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
      
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message || "An unknown error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
