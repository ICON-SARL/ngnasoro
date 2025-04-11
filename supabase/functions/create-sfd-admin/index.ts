
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

    // Extraire les données de la requête
    const adminData = await req.json();
    
    // Valider les données
    if (!adminData || !adminData.email || !adminData.password || !adminData.full_name || !adminData.sfd_id) {
      return new Response(
        JSON.stringify({ error: "Données incomplètes. Veuillez fournir email, password, full_name et sfd_id" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Création de l'utilisateur auth:", adminData.email);
    
    // 1. Créer l'utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: adminData.email,
      password: adminData.password,
      email_confirm: true,
      user_metadata: {
        full_name: adminData.full_name,
        sfd_id: adminData.sfd_id
      },
      app_metadata: {
        role: 'sfd_admin'
      }
    });

    if (authError) {
      console.error("Erreur lors de la création de l'utilisateur auth:", authError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Aucun utilisateur créé" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;
    console.log("Utilisateur auth créé avec ID:", userId);

    // 2. Créer l'entrée admin_users
    const { data: adminUserData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'sfd_admin',
        has_2fa: false
      });

    if (adminError) {
      console.error("Erreur lors de la création de l'admin_user:", adminError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'admin_user: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Admin utilisateur créé dans admin_users");

    // 3. Assigner le rôle sfd_admin via RPC
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: userId,
        role: 'sfd_admin'
      }
    );

    if (roleError) {
      console.error("Erreur lors de l'attribution du rôle:", roleError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'attribution du rôle: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Rôle sfd_admin attribué");

    // 4. Créer l'association avec la SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id: adminData.sfd_id,
        is_default: true
      });

    if (assocError) {
      console.error("Erreur lors de la création de l'association SFD:", assocError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'association SFD: ${assocError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Association SFD créée");

    // Si la notification est requise, on pourrait implémenter ici l'envoi d'email
    // Pour l'instant, juste indiquer que l'opération a réussi

    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email: adminData.email,
          full_name: adminData.full_name,
          role: 'sfd_admin'
        }
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
