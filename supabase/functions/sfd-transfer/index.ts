
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get request body
    const { fromAccountId, toPhone, amount, sfdId, description } = await req.json();
    
    // Validate required fields
    if (!fromAccountId || !toPhone || !amount || !sfdId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Paramètres manquants: fromAccountId, toPhone, amount et sfdId sont requis"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Initialize Supabase client with Service Role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify that the account exists and has sufficient funds
    const { data: account, error: accountError } = await supabase
      .from('sfd_accounts')
      .select('*')
      .eq('id', fromAccountId)
      .single();
      
    if (accountError || !account) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Compte source introuvable"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 404
        }
      );
    }
    
    if (account.balance < amount) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Solde insuffisant pour effectuer ce transfert"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Generate a unique transfer reference
    const transferId = `tr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // Update account balance
    const { error: updateError } = await supabase
      .from('sfd_accounts')
      .update({ 
        balance: account.balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('id', fromAccountId);
      
    if (updateError) {
      console.error("Error updating account balance:", updateError);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Erreur lors de la mise à jour du solde"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    // Create a record of the mobile money transfer attempt
    const { data: transferRecord, error: transferError } = await supabase
      .from('mobile_money_transfers')
      .insert({
        sfd_id: sfdId,
        account_id: fromAccountId,
        phone_number: toPhone,
        amount: amount,
        status: 'processed',
        reference_id: transferId,
        description: description || `Transfert vers ${toPhone}`
      })
      .select()
      .single();
      
    if (transferError) {
      console.error("Error recording transfer:", transferError);
      // Not a critical error, continue
    }
    
    // In a real implementation, we would call the mobile money provider's API here
    // For now, let's simulate a successful transfer
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfert mobile money traité avec succès",
        transferId: transferId,
        amount: amount,
        recipient: toPhone
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Erreur interne du serveur",
        error: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
