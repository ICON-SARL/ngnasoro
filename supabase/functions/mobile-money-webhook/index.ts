
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
    console.log("Received MTN Mobile Money webhook:", payload);

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
      phoneNumber
    } = payload;

    if (!paymentId || !status || !loanId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        }
      );
    }

    // Record the payment
    if (status === "SUCCESSFUL") {
      // Update loan status in the database
      const { data, error } = await supabase
        .from("transactions")
        .insert({
          user_id: userId,
          amount: amount,
          name: "Remboursement prêt",
          type: "Paiement Mobile Money",
          reference: transactionId || paymentId
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
            paidAmount: 13.90, // Simulated, in a real app we'd calculate this
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
        JSON.stringify({ success: true, message: "Payment recorded successfully" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    } else {
      console.warn(`Payment not successful, status: ${status}`);
      return new Response(
        JSON.stringify({ success: false, message: `Payment not successful, status: ${status}` }),
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
