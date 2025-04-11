
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
      return new Response(
        JSON.stringify({ error: "ID d'administrateur requis" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Suppression de l'administrateur SFD avec l'ID: ${adminId}`);

    // 1. Supprimer l'association SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .delete()
      .eq('user_id', adminId);

    if (assocError) {
      console.error("Erreur lors de la suppression de l'association SFD:", assocError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression de l'association SFD: ${assocError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Supprimer les rôles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', adminId)
      .eq('role', 'sfd_admin');

    if (roleError) {
      console.error("Erreur lors de la suppression du rôle:", roleError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression du rôle: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Supprimer l'enregistrement admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);

    if (adminError) {
      console.error("Erreur lors de la suppression de l'enregistrement admin:", adminError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression de l'enregistrement admin: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Supprimer l'utilisateur Auth (le plus important)
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId);

    if (authError) {
      console.error("Erreur lors de la suppression de l'utilisateur Auth:", authError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression de l'utilisateur Auth: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "Administrateur SFD supprimé avec succès" }),
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
