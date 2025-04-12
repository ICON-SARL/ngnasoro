
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
    const { sfdData, adminData } = await req.json();

    console.log("Données SFD reçues:", JSON.stringify(sfdData));
    
    if (!sfdData || !sfdData.name || !sfdData.code) {
      return new Response(
        JSON.stringify({ error: "Données SFD insuffisantes. Nom et code requis." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Créer la SFD
    const { data: newSfd, error: sfdError } = await supabase
      .from('sfds')
      .insert([sfdData])
      .select()
      .single();

    if (sfdError) {
      console.error("Erreur lors de la création de la SFD:", sfdError);
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de la SFD: ${sfdError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("SFD créée avec succès, ID:", newSfd.id);

    // 2. Créer une entrée de statistiques pour la nouvelle SFD
    const { error: statsError } = await supabase
      .from('sfd_stats')
      .insert({
        sfd_id: newSfd.id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0
      });

    if (statsError) {
      console.warn("Erreur lors de la création des statistiques:", statsError);
      // Continuer malgré l'erreur
    }

    // 3. Si des données d'admin sont fournies, créer l'administrateur
    let adminResult = null;
    if (adminData && adminData.email && adminData.password && adminData.full_name) {
      console.log("Création de l'administrateur SFD...");
      
      try {
        // Créer l'utilisateur dans auth.users
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email: adminData.email,
          password: adminData.password,
          email_confirm: true,
          user_metadata: {
            full_name: adminData.full_name,
            sfd_id: newSfd.id
          },
          app_metadata: {
            role: 'sfd_admin'
          }
        });

        if (authError) {
          console.error("Erreur lors de la création de l'utilisateur auth:", authError);
          // Continuer avec la SFD même si la création de l'admin échoue
        } else if (authUser.user) {
          const userId = authUser.user.id;
          console.log("Utilisateur auth créé avec ID:", userId);

          // Créer l'entrée admin_users
          const { error: adminError } = await supabase
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
          } else {
            console.log("Enregistrement admin_users créé");
          }

          // Assigner le rôle SFD_ADMIN
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
              sfd_id: newSfd.id,
              is_default: true
            });

          if (assocError) {
            console.error("Erreur lors de la création de l'association SFD:", assocError);
          } else {
            console.log("Association SFD créée");
          }

          adminResult = {
            id: userId,
            email: adminData.email,
            full_name: adminData.full_name,
            role: 'sfd_admin'
          };
        }
      } catch (adminCreateError) {
        console.error("Erreur lors de la création de l'admin:", adminCreateError);
        // Continuer avec la SFD même si la création de l'admin échoue
      }
    }

    // 4. Retourner le résultat
    return new Response(
      JSON.stringify({
        success: true,
        sfd: newSfd,
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
