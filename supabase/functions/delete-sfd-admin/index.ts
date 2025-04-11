
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

    // Extraire l'ID de l'administrateur à supprimer
    const { adminId } = await req.json();

    if (!adminId) {
      console.error("ID d'administrateur manquant");
      return new Response(
        JSON.stringify({ error: "ID d'administrateur manquant" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Suppression de l'administrateur SFD avec l'ID: ${adminId}`);

    // Étape 1: Vérifier que l'administrateur existe et est bien un administrateur SFD
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', adminId)
      .single();

    if (adminError) {
      console.error("Erreur lors de la vérification de l'admin_user:", adminError);
      if (adminError.code === 'PGRST116') {
        // L'utilisateur n'existe pas dans la table admin_users
        console.log(`Administrateur avec ID ${adminId} non trouvé dans admin_users`);
      } else {
        // Autre erreur
        return new Response(
          JSON.stringify({ error: `Erreur lors de la vérification de l'admin_user: ${adminError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Si l'administrateur n'existe pas dans admin_users mais que nous continuons quand même
    // (peut-être qu'il existe dans auth.users mais pas dans admin_users)
    if (!adminData) {
      console.warn(`Aucun enregistrement trouvé dans admin_users pour l'ID: ${adminId}, mais nous continuons la suppression`);
    } else if (adminData.role !== 'sfd_admin') {
      console.error(`L'utilisateur ${adminId} n'est pas un administrateur SFD (rôle: ${adminData.role})`);
      return new Response(
        JSON.stringify({ error: "L'utilisateur n'est pas un administrateur SFD" }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Étape 2: Supprimer les associations avec les SFDs (toujours tenter cette étape)
    try {
      const { error: assocError } = await supabase
        .from('user_sfds')
        .delete()
        .eq('user_id', adminId);

      if (assocError) {
        console.error("Erreur lors de la suppression des associations SFD:", assocError);
        // On continue malgré l'erreur, on nettoie le maximum
      } else {
        console.log(`Associations SFD supprimées pour l'utilisateur ${adminId}`);
      }
    } catch (error) {
      console.error("Erreur non gérée lors de la suppression des associations:", error);
      // On continue malgré l'erreur, on nettoie le maximum
    }

    // Étape 3: Supprimer l'enregistrement de la table admin_users (si existant)
    if (adminData) {
      try {
        const { error: removeError } = await supabase
          .from('admin_users')
          .delete()
          .eq('id', adminId);

        if (removeError) {
          console.error("Erreur lors de la suppression de l'admin_user:", removeError);
          // On continue malgré l'erreur, on nettoie le maximum
        } else {
          console.log(`Enregistrement admin_users supprimé pour l'utilisateur ${adminId}`);
        }
      } catch (error) {
        console.error("Erreur non gérée lors de la suppression dans admin_users:", error);
        // On continue malgré l'erreur, on nettoie le maximum
      }
    }

    // Étape 4: Supprimer l'utilisateur de la base d'authentification
    try {
      const { error: deleteError } = await supabase.auth.admin.deleteUser(adminId);

      if (deleteError) {
        console.error("Erreur lors de la suppression de l'utilisateur:", deleteError);
        return new Response(
          JSON.stringify({ error: `Erreur lors de la suppression de l'utilisateur: ${deleteError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log(`Utilisateur ${adminId} supprimé avec succès de la base d'authentification`);
    } catch (error) {
      console.error("Erreur non gérée lors de la suppression dans auth.users:", error);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression de l'utilisateur: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Administrateur SFD ${adminId} supprimé avec succès`);
    
    return new Response(
      JSON.stringify({ success: true }),
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
