
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
      if (req.method === 'POST') {
        const requestData = await req.json();
        sfdId = requestData.sfdId;
        console.log(`Requête reçue avec sfdId: ${sfdId}`);
      }
    } catch (error) {
      // Si le parsing JSON échoue, on continue sans sfdId
      console.log("Aucun paramètre sfdId fourni ou format de requête invalide");
    }
    
    let admins = [];
    
    if (sfdId) {
      console.log(`Récupération des administrateurs pour la SFD: ${sfdId}`);
      
      try {
        // Vérifier d'abord si la SFD existe
        const { data: sfdExists, error: sfdError } = await supabase
          .from('sfds')
          .select('id')
          .eq('id', sfdId)
          .single();
          
        if (sfdError || !sfdExists) {
          console.error(`SFD ${sfdId} non trouvée:`, sfdError);
          return new Response(
            JSON.stringify({ error: `SFD non trouvée: ${sfdId}` }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
          
        // Utiliser une requête simplifiée pour récupérer les administrateurs
        const { data: userSfds, error: userSfdsError } = await supabase
          .from('user_sfds')
          .select('user_id')
          .eq('sfd_id', sfdId);
          
        if (userSfdsError) {
          console.error('Erreur lors de la récupération des associations utilisateur-SFD:', userSfdsError);
          return new Response(
            JSON.stringify({ error: `Erreur de requête: ${userSfdsError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Si aucun utilisateur n'est associé à cette SFD, retourner un tableau vide
        if (!userSfds || userSfds.length === 0) {
          console.log(`Aucun administrateur trouvé pour la SFD ${sfdId}`);
          return new Response(
            JSON.stringify([]),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        // Extraire les IDs des utilisateurs
        const userIds = userSfds.map(item => item.user_id);
        
        // Récupérer les informations des administrateurs
        const { data: adminUsers, error: adminUsersError } = await supabase
          .from('admin_users')
          .select('id, email, full_name, role, has_2fa, last_sign_in_at')
          .in('id', userIds)
          .eq('role', 'sfd_admin');
          
        if (adminUsersError) {
          console.error('Erreur lors de la récupération des administrateurs:', adminUsersError);
          return new Response(
            JSON.stringify({ error: `Erreur de requête: ${adminUsersError.message}` }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        
        admins = adminUsers || [];
        console.log(`${admins.length || 0} administrateurs SFD récupérés pour la SFD ${sfdId}`);
        
      } catch (error) {
        console.error(`Erreur non gérée dans la récupération des admins pour SFD ${sfdId}:`, error);
        return new Response(
          JSON.stringify({ error: `Erreur inattendue: ${error.message || "Erreur inconnue"}` }),
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
          .limit(100); // Limiter le nombre de résultats
          
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
          JSON.stringify({ error: `Erreur inattendue: ${error.message || "Erreur inconnue"}` }),
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
