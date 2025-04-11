
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
    const requestData = await req.json();
    const { email, password, full_name, role, sfd_id, notify = false } = requestData;

    if (!email || !password || !full_name || !role || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Données manquantes pour créer l'administrateur" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Création d'un nouvel administrateur SFD: ${email}`);

    // Étape 1: Créer un nouvel utilisateur avec l'API Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true, // Auto-confirmer l'email
      app_metadata: { provider: 'email', role: role }
    });

    if (userError) {
      console.error("Erreur lors de la création de l'utilisateur:", userError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur: ${userError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`Utilisateur créé avec succès, ID: ${userId}`);

    // Étape 2: Ajouter les informations à la table admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email,
        full_name,
        role,
        has_2fa: false
      });

    if (adminError) {
      console.error("Erreur lors de l'ajout dans admin_users:", adminError);
      
      // Tenter de supprimer l'utilisateur créé pour éviter un état incohérent
      await supabase.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'ajout dans admin_users: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Étape 3: Associer l'administrateur à la SFD dans user_sfds
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id,
        is_default: true
      });

    if (assocError) {
      console.error("Erreur lors de l'association à la SFD:", assocError);
      
      // Tenter de nettoyer les données créées précédemment
      await supabase.from('admin_users').delete().eq('id', userId);
      await supabase.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'association à la SFD: ${assocError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Étape 4: Si notify est true, envoyer un email de bienvenue (non implémenté ici)
    if (notify) {
      console.log(`Notification d'invitation à envoyer à ${email}`);
      // Implémenter l'envoi d'email ici
    }

    console.log(`Administrateur SFD créé avec succès: ${email}`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        user: { 
          id: userId, 
          email, 
          full_name, 
          role 
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
