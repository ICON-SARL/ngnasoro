
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { transactionId } = await req.json();

    if (!transactionId) {
      return new Response(
        JSON.stringify({ error: "Transaction ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get the transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .single();

    if (txError) {
      console.error("Error fetching transaction:", txError);
      return new Response(
        JSON.stringify({ error: txError.message }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (!transaction) {
      return new Response(
        JSON.stringify({ error: "Transaction not found" }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // If transaction has a client_id, get the corresponding user_id
    let userId = transaction.user_id;

    if (transaction.client_id && !userId) {
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', transaction.client_id)
        .single();

      if (clientError || !client || !client.user_id) {
        return new Response(
          JSON.stringify({ error: "Could not resolve client's user account" }),
          { headers: corsHeaders, status: 404 }
        );
      }

      userId = client.user_id;
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "No user associated with this transaction" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Create a new transaction for the user application account
    const { data: newTransaction, error: createError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        sfd_id: transaction.sfd_id,
        type: transaction.type,
        amount: transaction.amount,
        status: 'success',
        name: transaction.name || 'Transaction',
        description: transaction.description || 'Transaction propagée du compte client',
        reference_id: `prop-${transactionId}`
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating propagated transaction:", createError);
      return new Response(
        JSON.stringify({ error: createError.message }),
        { headers: corsHeaders, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Transaction successfully propagated",
        transaction: newTransaction
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error("Error in propagate-transaction function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
