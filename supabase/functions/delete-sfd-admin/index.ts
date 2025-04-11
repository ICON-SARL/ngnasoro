
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

    // Créer un client Supabase avec la clé de service pour accéder aux API Admin
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extraire l'ID de l'admin à supprimer
    const { adminId } = await req.json();
    
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: "ID d'administrateur non fourni" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Suppression de l'administrateur SFD: ${adminId}`);
    
    // 1. Supprimer les associations avec les SFDs
    const { error: assocError } = await supabase
      .from('user_sfds')
      .delete()
      .eq('user_id', adminId);

    if (assocError) {
      console.error("Erreur lors de la suppression des associations SFD:", assocError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression des associations: ${assocError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Supprimer l'entrée dans user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', adminId);

    if (roleError) {
      console.error("Erreur lors de la suppression des rôles:", roleError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression des rôles: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Supprimer l'entrée dans admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);

    if (adminError) {
      console.error("Erreur lors de la suppression de l'admin_user:", adminError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression de l'admin_user: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Supprimer l'utilisateur auth
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId);

    if (authError) {
      console.error("Erreur lors de la suppression de l'utilisateur auth:", authError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la suppression de l'utilisateur: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Administrateur SFD supprimé avec succès");

    return new Response(
      JSON.stringify({
        success: true,
        message: "Administrateur SFD supprimé avec succès"
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
