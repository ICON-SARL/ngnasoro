
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

    // Extraire les données de la requête
    const { email, password, full_name, role, sfd_id, notify } = await req.json();
    
    console.log("Requête reçue pour créer un administrateur SFD:", { 
      email, 
      full_name, 
      role, 
      sfd_id, 
      notify,
      hasPassword: !!password 
    });
    
    // Valider les champs requis
    if (!email || !password || !full_name || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Champs obligatoires manquants" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Créer un utilisateur Auth avec privilèges d'admin
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
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
      console.error("Erreur lors de la création de l'utilisateur Auth:", authError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur Auth: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "Aucun utilisateur créé" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;
    console.log("Utilisateur créé avec succès avec l'ID:", userId);

    // 2. Créer une entrée dans la table admin_users
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
      console.error("Erreur lors de la création de l'enregistrement admin:", adminError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'enregistrement admin: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Enregistrement admin créé");

    // 3. Attribuer le rôle SFD_ADMIN
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

    console.log("Rôle SFD_ADMIN attribué");

    // 4. Créer l'association avec la SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id: sfd_id,
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

    // 5. Envoyer une notification si demandé (simplifié pour le moment)
    if (notify) {
      console.log("Devrait envoyer une notification à:", email);
      // La logique de notification irait ici
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userId,
          email,
          full_name,
          role: 'sfd_admin'
        }
      }),
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
