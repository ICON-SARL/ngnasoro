
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
    // Récupérer l'ID SFD depuis l'URL
    const url = new URL(req.url);
    const pathParts = url.pathname.split('/');
    const sfdId = pathParts[pathParts.length - 1];
    
    if (!sfdId || sfdId === 'meref-funding') {
      return new Response(
        JSON.stringify({ error: "ID SFD manquant dans la requête" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Récupérer les fonds MEREF disponibles pour cette SFD
    const { data: subsidies, error: subsidiesError } = await supabase
      .from('sfd_subsidies')
      .select('remaining_amount, amount, used_amount, status')
      .eq('sfd_id', sfdId)
      .eq('status', 'active');
      
    if (subsidiesError) {
      console.error("Erreur lors de la récupération des subventions:", subsidiesError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la récupération des subventions: ${subsidiesError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Calculer le montant total disponible
    let availableAmount = 0;
    if (subsidies && subsidies.length > 0) {
      availableAmount = subsidies.reduce((total, subsidy) => total + (subsidy.remaining_amount || 0), 0);
    }
    
    // Récupérer également les statistiques de prêts
    const { data: loans, error: loansError } = await supabase
      .from('sfd_loans')
      .select('amount, status')
      .eq('sfd_id', sfdId);
      
    if (loansError) {
      console.error("Erreur lors de la récupération des prêts:", loansError);
    }
    
    // Statistiques sur les prêts
    let stats = {
      totalLoans: 0,
      totalAmount: 0,
      pendingLoans: 0,
      approvedLoans: 0,
      activeLoans: 0
    };
    
    if (loans && loans.length > 0) {
      stats.totalLoans = loans.length;
      stats.totalAmount = loans.reduce((total, loan) => total + loan.amount, 0);
      stats.pendingLoans = loans.filter(loan => loan.status === 'pending').length;
      stats.approvedLoans = loans.filter(loan => loan.status === 'approved').length;
      stats.activeLoans = loans.filter(loan => loan.status === 'active').length;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        availableAmount,
        subsidies,
        loanStats: stats
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error("Erreur non gérée:", error);
    return new Response(
      JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
