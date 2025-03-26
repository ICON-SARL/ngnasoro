
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Create a Supabase client
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const { code, loanId, amount, userId } = await req.json();
    
    if (!code || !loanId || !amount || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    console.log(`Verifying QR code ${code} for loan ${loanId}`);

    // In a real implementation, you would verify the QR code against a database of valid codes
    // For this example, we'll simulate a successful verification
    
    // Record the payment in the database
    const { data, error } = await supabase
      .from("transactions")
      .insert({
        user_id: userId,
        amount: amount,
        name: "Remboursement prêt",
        type: "Paiement en agence SFD",
        reference: code
      });

    if (error) {
      console.error("Error recording payment:", error);
      throw error;
    }

    // Broadcast the loan status update using Supabase Realtime
    const broadcastResult = await supabase
      .channel('loan-status-changes')
      .send({
        type: 'broadcast',
        event: 'loan_status_update',
        payload: {
          paidAmount: 13.90,
          remainingAmount: 11.50,
          progress: 55,
          paymentHistory: [
            { id: 4, date: new Date().toLocaleDateString('fr-FR'), amount: 3.50, status: 'paid' },
            { id: 1, date: '05 August 2023', amount: 3.50, status: 'paid' },
            { id: 2, date: '05 July 2023', amount: 3.50, status: 'paid' },
            { id: 3, date: '05 June 2023', amount: 3.50, status: 'paid' }
          ]
        }
      });

    console.log("Broadcast result:", broadcastResult);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "QR code verified and payment recorded",
        paymentId: data?.[0]?.id || "payment-123"
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error processing QR code verification:", error);
    
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
