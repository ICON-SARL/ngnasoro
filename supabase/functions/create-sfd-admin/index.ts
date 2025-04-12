
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

    // Récupération du corps de la requête
    const { email, password, full_name, role, sfd_id, notify } = await req.json();

    // Validation des données
    if (!email || !password || !full_name || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Données insuffisantes. Email, password, full_name et sfd_id sont requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Création d'un admin SFD pour ${email}`);

    // Vérifier que la SFD existe
    const { data: sfdExists, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', sfd_id)
      .single();

    if (sfdError || !sfdExists) {
      console.error("Erreur ou SFD introuvable:", sfdError);
      return new Response(
        JSON.stringify({ error: "La SFD spécifiée n'existe pas" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si l'email est déjà utilisé
    const { data: existingUser, error: existingUserError } = await supabase
      .from('admin_users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: "Cet email est déjà utilisé" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Créer l'utilisateur dans auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        sfd_id
      },
      app_metadata: {
        role: 'sfd_admin'
      }
    });

    if (authError) {
      console.error("Erreur lors de la création de l'utilisateur auth:", authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authUser.user) {
      console.error("Aucun utilisateur créé");
      return new Response(
        JSON.stringify({ error: "Échec de création de l'utilisateur admin" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authUser.user.id;
    console.log("Utilisateur auth créé avec ID:", userId);

    // 2. Créer l'entrée admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email,
        full_name,
        role: 'sfd_admin',
        has_2fa: false
      });

    if (adminError) {
      console.error("Erreur lors de la création de l'admin_user:", adminError);
      return new Response(
        JSON.stringify({ error: adminError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Enregistrement admin_users créé");

    // 3. Assigner le rôle SFD_ADMIN
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
        JSON.stringify({ error: roleError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Rôle sfd_admin attribué");

    // 4. Créer l'association avec la SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id,
        is_default: true
      });

    if (assocError) {
      console.error("Erreur lors de la création de l'association SFD:", assocError);
      return new Response(
        JSON.stringify({ error: assocError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Association SFD créée");

    // 5. Si notify est true, envoyer une notification
    if (notify) {
      try {
        const { error: notifError } = await supabase
          .from('admin_notifications')
          .insert({
            recipient_id: userId,
            sender_id: userId, // Auto-notification pour l'instant
            title: "Compte administrateur créé",
            message: `Un compte administrateur a été créé pour vous sur la SFD ${sfdExists.name}. Veuillez vous connecter avec l'email ${email}.`,
            type: "account_creation"
          });

        if (notifError) {
          console.warn("Erreur lors de l'envoi de la notification:", notifError);
        }
      } catch (notifError) {
        console.warn("Erreur lors de l'envoi de la notification:", notifError);
        // Continuer même si la notification échoue
      }
    }

    // 6. Retourner les données de l'utilisateur créé
    return new Response(
      JSON.stringify({
        success: true,
        user: {
          id: userId,
          email,
          full_name,
          role: 'sfd_admin',
          has_2fa: false
        }
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
