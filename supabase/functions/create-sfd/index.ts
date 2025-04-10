
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
    const { sfd_data, admin_data } = await req.json();

    console.log("Données SFD reçues:", JSON.stringify(sfd_data));
    
    if (!sfd_data || !sfd_data.name || !sfd_data.code) {
      return new Response(
        JSON.stringify({ error: "Données SFD insuffisantes. Nom et code requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Création de la SFD en utilisant la fonction SQL
    const { data: sfdResult, error: sfdError } = await supabase.rpc(
      'create_sfd_with_admin',
      { sfd_data }
    );

    if (sfdError) {
      console.error("Erreur lors de la création de la SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de la SFD: ${sfdError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const newSfdId = sfdResult.sfd.id;
    console.log("SFD créée avec succès, ID:", newSfdId);

    // 2. Si des données d'admin sont fournies, créer l'administrateur
    let adminResult = null;
    if (admin_data && admin_data.email && admin_data.password && admin_data.full_name) {
      console.log("Création de l'administrateur SFD...");
      
      // Créer l'utilisateur dans auth.users
      const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
        email: admin_data.email,
        password: admin_data.password,
        email_confirm: true,
        user_metadata: {
          full_name: admin_data.full_name,
          sfd_id: newSfdId
        },
        app_metadata: {
          role: 'sfd_admin'
        }
      });

      if (authError) {
        console.error("Erreur lors de la création de l'utilisateur auth:", authError);
        return new Response(
          JSON.stringify({ 
            error: `Erreur lors de la création de l'utilisateur: ${authError.message}`,
            sfd: sfdResult.sfd // Retourner la SFD créée malgré l'erreur
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      if (!authUser.user) {
        console.error("Aucun utilisateur créé");
        return new Response(
          JSON.stringify({ 
            error: "Échec de création de l'utilisateur admin",
            sfd: sfdResult.sfd
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const userId = authUser.user.id;
      console.log("Utilisateur auth créé avec ID:", userId);

      // Créer l'entrée admin_users
      const { error: adminError } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: admin_data.email,
          full_name: admin_data.full_name,
          role: 'sfd_admin',
          has_2fa: false
        });

      if (adminError) {
        console.error("Erreur lors de la création de l'admin_user:", adminError);
      } else {
        console.log("Enregistrement admin_users créé");
      }

      // Assigner le rôle SFD_ADMIN via RPC
      const { error: roleError } = await supabase.rpc(
        'assign_role',
        {
          user_id: userId,
          role: 'sfd_admin'
        }
      );

      if (roleError) {
        console.error("Erreur lors de l'attribution du rôle:", roleError);
      } else {
        console.log("Rôle sfd_admin attribué");
      }

      // Créer l'association avec la SFD
      const { error: assocError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: userId,
          sfd_id: newSfdId,
          is_default: true
        });

      if (assocError) {
        console.error("Erreur lors de la création de l'association SFD:", assocError);
      } else {
        console.log("Association SFD créée");
      }

      adminResult = {
        id: userId,
        email: admin_data.email,
        full_name: admin_data.full_name,
        role: 'sfd_admin'
      };
    }

    // 3. Retourner le résultat
    return new Response(
      JSON.stringify({
        success: true,
        sfd: sfdResult.sfd,
        admin: adminResult
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
