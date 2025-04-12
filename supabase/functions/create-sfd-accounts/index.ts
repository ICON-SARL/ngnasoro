
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupération du corps de la requête
    const { sfdData, adminData, accounts } = await req.json();

    // Validation des données requises
    if (!sfdData || !sfdData.name || !sfdData.code) {
      return new Response(
        JSON.stringify({ error: "Données SFD insuffisantes. Nom et code requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!adminData || !adminData.email || !adminData.password || !adminData.full_name) {
      return new Response(
        JSON.stringify({ error: "Données admin insuffisantes. Email, mot de passe et nom complet requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Tentative de création de SFD avec admin et comptes...");

    // Démarrer une transaction via RPC
    const { data: transactionResult, error: transactionError } = await supabase.rpc(
      'create_sfd_with_admin_and_accounts',
      {
        sfd_data: sfdData,
        admin_data: adminData,
        account_types: accounts?.types || ['operation', 'remboursement', 'epargne']
      }
    );

    if (transactionError) {
      console.error("Erreur lors de la transaction:", transactionError);
      return new Response(
        JSON.stringify({ error: `Erreur de transaction: ${transactionError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Réponse réussie
    return new Response(
      JSON.stringify({
        success: true,
        data: transactionResult
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error("Erreur non gérée:", error);
    return new Response(
      JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
