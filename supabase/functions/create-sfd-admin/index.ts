
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
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Erreur lors du parsing du JSON:", error);
      return new Response(
        JSON.stringify({ error: "Format de requête invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("Données reçues:", JSON.stringify({
      ...requestData,
      password: "******" // Masquer le mot de passe dans les logs
    }));
    
    const { email, password, full_name, role, sfd_id, notify = false } = requestData;

    // Validation des données
    if (!email || !password || !full_name || !role || !sfd_id) {
      console.error("Données manquantes:", { 
        hasEmail: !!email, 
        hasPassword: !!password, 
        hasFullName: !!full_name, 
        hasRole: !!role, 
        hasSfdId: !!sfd_id 
      });
      return new Response(
        JSON.stringify({ error: "Données manquantes pour créer l'administrateur" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérification du format d'email basique
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: "Format d'email invalide" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérification de la longueur du mot de passe
    if (password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit contenir au moins 8 caractères" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que la SFD existe
    const { data: sfdExists, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name, status')
      .eq('id', sfd_id)
      .single();
      
    if (sfdError || !sfdExists) {
      console.error("SFD non trouvée:", sfd_id, sfdError);
      return new Response(
        JSON.stringify({ error: "La SFD spécifiée n'existe pas" }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier si la SFD est active
    if (sfdExists.status !== 'active') {
      return new Response(
        JSON.stringify({ error: "Impossible de créer un administrateur pour une SFD inactive" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Création d'un nouvel administrateur SFD: ${email} pour la SFD ${sfdExists.name}`);

    // Vérification rapide si l'utilisateur existe déjà
    const { data: existingUsers, error: checkError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email)
      .limit(1);

    if (checkError) {
      console.error("Erreur lors de la vérification de l'utilisateur existant:", checkError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la vérification de l'utilisateur: ${checkError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (existingUsers && existingUsers.length > 0) {
      console.error("Email déjà utilisé:", email);
      return new Response(
        JSON.stringify({ error: "Cet email est déjà utilisé. Veuillez utiliser un autre email." }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un nouvel utilisateur avec l'API Supabase Auth
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { full_name },
      email_confirm: true, // Auto-confirmer l'email
      app_metadata: { provider: 'email', role: role }
    });

    if (userError) {
      console.error("Erreur lors de la création de l'utilisateur:", userError);
      
      // Gestion spéciale pour les erreurs d'email déjà utilisé
      if (userError.message.includes('already registered') || userError.message.includes('already been registered')) {
        return new Response(
          JSON.stringify({ error: "Cet email est déjà utilisé. Veuillez utiliser un autre email." }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de l'utilisateur: ${userError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'utilisateur a bien été créé
    if (!userData?.user?.id) {
      console.error("Utilisateur non créé - données manquantes:", userData);
      return new Response(
        JSON.stringify({ error: "Erreur lors de la création de l'utilisateur: données manquantes" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = userData.user.id;
    console.log(`Utilisateur créé avec succès, ID: ${userId}`);

    // Ajouter directement dans la table admin_users
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email: email,
        full_name: full_name,
        role: role,
        has_2fa: false
      });

    if (adminError) {
      console.error("Erreur lors de l'ajout dans admin_users:", adminError);
      
      // Si l'insertion échoue, supprimer l'utilisateur pour éviter un état incohérent
      await supabase.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'ajout dans admin_users: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Attribuer le rôle administrateur
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: userId,
        role: role
      }
    );

    if (roleError) {
      console.error("Erreur lors de l'attribution du rôle:", roleError);
      
      // Nettoyer en cas d'erreur
      await supabase.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'attribution du rôle: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Associer l'administrateur à la SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id,
        is_default: true
      });

    if (assocError) {
      console.error("Erreur lors de l'association à la SFD:", assocError);
      
      // Nettoyer les données créées précédemment
      await supabase.auth.admin.deleteUser(userId);
      
      return new Response(
        JSON.stringify({ error: `Erreur lors de l'association à la SFD: ${assocError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Notification (à implémenter si nécessaire)
    if (notify) {
      console.log(`Notification d'invitation à envoyer à ${email}`);
      // Implémenter l'envoi d'email ici si besoin
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
