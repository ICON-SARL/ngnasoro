
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
          type: transactionType,
          amount: isWithdrawal ? -amount : -amount, // Negative for withdrawal/payment
          date: new Date().toISOString()
        })
        .select()
        .single();
        
      if (transactionError) {
        console.error("Transaction error:", transactionError);
        return new Response(
          JSON.stringify({ error: "Failed to process transaction" }),
          { 
            status: 500, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }
      
      // Return success response with transaction details
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: `${isWithdrawal ? "Retrait" : "Paiement"} Mobile Money initié`,
          transaction: transaction,
          reference: `MM${Date.now().toString().substring(5)}`,
          providerResponse: {
            status: "pending",
            providerReference: `${provider.toUpperCase()}${Math.floor(Math.random() * 10000000)}`,
            estimatedCompletion: new Date(Date.now() + 5 * 60000).toISOString()
          }
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Handle QR Code request
    if (payload.action === "qrCode") {
      const { userId, amount, isWithdrawal } = payload as QRCodeRequest;
      
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
      
      // Generate a unique QR code (in a real implementation, this would be more secure)
      const qrCodeData = {
        userId: userId,
        amount: amount,
        isWithdrawal: isWithdrawal,
        timestamp: Date.now(),
        expiresAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 minutes expiry
        code: `QR${Math.random().toString(36).substring(2, 10).toUpperCase()}${Date.now().toString(36)}`
      };
      
      // In a production environment, we would store this QR code data in the database
      // and potentially encrypt sensitive information
      
      // Return QR code data
      return new Response(
        JSON.stringify({
          success: true,
          qrCode: qrCodeData
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // If no valid action specified
    return new Response(
      JSON.stringify({ error: "Invalid action specified" }),
      { 
        status: 400, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
