
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
    // Récupérer les variables d'environnement nécessaires
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec la clé de service (privilèges administratifs)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer le paramètre sfdId (s'il existe)
    let sfdId = null;
    try {
      const requestData = await req.json().catch(() => ({}));
      sfdId = requestData.sfdId;
    } catch (error) {
      // Si le parsing JSON échoue, on continue sans sfdId
      console.log("Aucun paramètre sfdId fourni ou format de requête invalide");
    }
    
    let admins = [];
    
    if (sfdId) {
      console.log(`Récupération des administrateurs pour la SFD: ${sfdId}`);
      
      try {
        // Utiliser une requête optimisée pour récupérer les administrateurs de la SFD
        const { data, error } = await supabase
          .from('user_sfds')
          .select(`
            user_id,
            admin_users:user_id (id, email, full_name, role, has_2fa, last_sign_in_at)
          `)
          .eq('sfd_id', sfdId)
          .eq('admin_users.role', 'sfd_admin');
          
        if (error) {
          console.error('Erreur lors de la récupération des administrateurs SFD:', error);
          return new Response(
            JSON.stringify({ error: `Erreur lors de la récupération des administrateurs: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Extraire et formater les données pour le client
        admins = data
          ?.filter(item => item.admin_users)
          .map(item => item.admin_users);
        
        console.log(`${admins.length || 0} administrateurs SFD récupérés pour la SFD ${sfdId}`);
      } catch (error) {
        console.error(`Erreur non gérée dans la récupération des admins pour SFD ${sfdId}:`, error);
        return new Response(
          JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    } else {
      console.log('Récupération de tous les administrateurs SFD');
      
      try {
        // Récupérer tous les admin_users avec le rôle sfd_admin
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('role', 'sfd_admin')
          .limit(100); // Limiter le nombre de résultats pour améliorer les performances
          
        if (error) {
          console.error('Erreur lors de la récupération des administrateurs SFD:', error);
          return new Response(
            JSON.stringify({ error: `Erreur lors de la récupération des administrateurs: ${error.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        admins = data || [];
        console.log(`${admins.length || 0} administrateurs SFD récupérés au total`);
      } catch (error) {
        console.error('Erreur non gérée dans la récupération de tous les admins:', error);
        return new Response(
          JSON.stringify({ error: `Erreur inattendue: ${error.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    return new Response(
      JSON.stringify(admins || []),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Erreur non gérée:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Une erreur inattendue s'est produite" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
