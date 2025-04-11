
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get the request body
    const { clientId, sfdId } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ success: false, error: "ID client manquant" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // First, check if the client exists
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('id, user_id, sfd_id')
      .eq('id', clientId)
      .single();

    if (clientError || !clientData) {
      return new Response(
        JSON.stringify({ success: false, error: "Client non trouvé", details: clientError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
      );
    }

    // Ensure we have a user_id to link the account
    if (!clientData.user_id) {
      return new Response(
        JSON.stringify({ success: false, error: "Ce client n'est pas lié à un compte utilisateur" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    // Call the database function to sync client accounts
    const { data: syncResult, error: syncError } = await supabase
      .rpc('sync_client_accounts', { 
        p_sfd_id: clientData.sfd_id, 
        p_client_id: clientId 
      });

    if (syncError) {
      return new Response(
        JSON.stringify({ success: false, error: "Erreur lors de la synchronisation", details: syncError }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }

    // For each client transaction, ensure it's propagated to the user account
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    if (!transactionsError && transactions) {
      for (const transaction of transactions) {
        // Check if this transaction has already been propagated
        const { data: existingTransaction, error: checkError } = await supabase
          .from('transactions')
          .select('id')
          .eq('reference_id', `prop-${transaction.id}`)
          .eq('user_id', clientData.user_id)
          .single();

        if (!existingTransaction && !checkError) {
          // Propagate the transaction to the user account
          await supabase.rpc('propagate_client_transaction', { p_transaction_id: transaction.id });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Comptes synchronisés avec succès",
        synchronized: syncResult
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
