
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

    // Vérification des variables d'environnement
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ error: "Configuration du serveur incorrecte" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Création du client Supabase avec la clé de service
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer tous les utilisateurs sans rôle défini
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Erreur lors de la récupération des utilisateurs:", usersError);
      return new Response(
        JSON.stringify({ error: "Impossible de récupérer les utilisateurs" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compteurs pour les statistiques
    let updatedCount = 0;
    const updatedUsers = [];

    // Parcourir tous les utilisateurs et leur attribuer un rôle par défaut si nécessaire
    for (const user of users.users) {
      if (!user.app_metadata?.role) {
        // Par défaut, attribuer le rôle "client"
        const role = 'client';
        
        const { error } = await supabase.auth.admin.updateUserById(
          user.id,
          { app_metadata: { ...user.app_metadata, role } }
        );

        if (error) {
          console.error(`Erreur lors de la mise à jour du rôle pour l'utilisateur ${user.id}:`, error);
          continue;
        }

        updatedCount++;
        updatedUsers.push({
          id: user.id,
          email: user.email,
          role
        });
      }
    }

    // Retourner un rapport de synchronisation
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation des rôles terminée. ${updatedCount} utilisateurs mis à jour.`,
        updated_users: updatedUsers
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
