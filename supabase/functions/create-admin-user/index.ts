
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Gestion des requêtes CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Récupérer les variables d'environnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Variables d'environnement manquantes");
      return new Response(
        JSON.stringify({ success: false, message: "Erreur de configuration du serveur" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Créer un client Supabase avec la clé de service (privilèges admin)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Analyser les données du corps de la requête
    const requestData = await req.json();
    
    const { email, password, full_name, role } = requestData;
    
    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ success: false, message: "Données incomplètes" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier si un utilisateur avec cet email existe déjà
    const { data: existingUsers, error: searchError } = await supabase
      .from('admin_users')
      .select('email')
      .eq('email', email);
    
    if (searchError) {
      throw searchError;
    }
    
    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Un utilisateur avec cet email existe déjà" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Création d'un nouvel administrateur avec le rôle ${role}`);
    
    // Créer le nouvel utilisateur dans auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        email_verified: true
      },
      app_metadata: {
        role
      }
    });
    
    if (authError) {
      console.error("Erreur lors de la création de l'utilisateur dans auth:", authError);
      throw authError;
    }
    
    const userId = authData.user.id;
    
    // Ajouter l'utilisateur à la table admin_users
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
      console.error("Erreur lors de l'ajout à admin_users:", adminError);
      throw adminError;
    }
    
    // Ajouter le rôle dans la table user_roles
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: userId,
        role
      });
    
    if (roleError) {
      console.error("Erreur lors de l'ajout à user_roles:", roleError);
      throw roleError;
    }
    
    console.log(`Administrateur créé avec succès: ${full_name} (${email})`);
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Administrateur créé avec succès",
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
      JSON.stringify({ 
        success: false, 
        message: error.message || "Une erreur inattendue s'est produite" 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
