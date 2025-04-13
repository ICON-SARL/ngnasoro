
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: { Authorization: req.headers.get("Authorization")! },
      },
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error("Authentication error:", authError);
      return new Response(
        JSON.stringify({ success: false, message: "Authentification requise" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const { action, requestId } = await req.json();

    // Handle different actions
    if (action === "transfer") {
      return await handleFundTransfer(supabase, requestId, user.id);
    } else {
      return new Response(
        JSON.stringify({ success: false, message: "Action non supportée" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Erreur interne du serveur", error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function handleFundTransfer(supabase, requestId, userId) {
  console.log(`Handling fund transfer for request ${requestId} by user ${userId}`);
  
  try {
    // Start a transaction
    const { data: { user_roles } } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .single();
    
    // Only admin users should be able to transfer funds
    if (!user_roles || user_roles.role !== 'admin') {
      return new Response(
        JSON.stringify({ success: false, message: "Permission refusée. Seuls les administrateurs peuvent effectuer cette action." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get the fund request details
    const { data: fundRequest, error: requestError } = await supabase
      .from('meref_fund_requests')
      .select('*')
      .eq('id', requestId)
      .eq('status', 'approved') // Only approved requests can be processed
      .single();
    
    if (requestError || !fundRequest) {
      console.error("Request error:", requestError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Demande de fonds non trouvée ou non approuvée"
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Find the SFD operation account
    const { data: sfdAccount, error: accountError } = await supabase
      .from('sfd_accounts')
      .select('*')
      .eq('sfd_id', fundRequest.sfd_id)
      .eq('account_type', 'operation')
      .single();
    
    if (accountError || !sfdAccount) {
      console.error("Account error:", accountError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Compte d'opération de la SFD non trouvé" 
        }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update the SFD account balance
    const { error: updateError } = await supabase
      .from('sfd_accounts')
      .update({
        balance: sfdAccount.balance + fundRequest.amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', sfdAccount.id);
    
    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Erreur lors de la mise à jour du solde du compte" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update the fund request status to completed
    const { error: statusError } = await supabase
      .from('meref_fund_requests')
      .update({
        status: 'completed',
        credited_at: new Date().toISOString()
      })
      .eq('id', requestId);
    
    if (statusError) {
      console.error("Status update error:", statusError);
      // If we get here, the account was credited but the status wasn't updated
      // This is a potential inconsistency, but the funds were transferred
      return new Response(
        JSON.stringify({ 
          success: true,
          partial: true,
          message: "Les fonds ont été transférés mais la mise à jour du statut a échoué",
          amount: fundRequest.amount
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create a transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: fundRequest.requested_by,
        sfd_id: fundRequest.sfd_id,
        amount: fundRequest.amount,
        type: 'deposit',
        name: 'Financement MEREF',
        description: `Financement approuvé: ${fundRequest.purpose}`,
        reference_id: `meref-fund-${requestId}`,
        payment_method: 'meref_transfer'
      });
    
    if (transactionError) {
      console.error("Transaction record error:", transactionError);
      // Non-critical error, continue
    }
    
    // Create a notification for the SFD
    const { error: notificationError } = await supabase
      .from('admin_notifications')
      .insert({
        title: 'Fonds MEREF reçus',
        message: `Un montant de ${fundRequest.amount.toLocaleString()} FCFA a été crédité sur votre compte d'opération`,
        recipient_id: fundRequest.requested_by,
        type: 'fund_transfer_completed',
        action_link: `/sfd/fund-requests/${requestId}`,
        sender_id: userId
      });
    
    if (notificationError) {
      console.error("Notification error:", notificationError);
      // Non-critical error, continue
    }
    
    // All operations completed successfully
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Les fonds ont été transférés avec succès", 
        amount: fundRequest.amount,
        sfdId: fundRequest.sfd_id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Fund transfer error:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "Erreur lors du transfert des fonds", 
        error: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
}
