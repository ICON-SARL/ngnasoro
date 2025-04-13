
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

    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("Erreur lors de la récupération des utilisateurs:", usersError);
      return new Response(
        JSON.stringify({ error: "Impossible de récupérer les utilisateurs" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Compteurs pour les statistiques
    let updatedCount = 0;
    let userRolesCount = 0;
    const updatedUsers = [];

    // Parcourir tous les utilisateurs et leur attribuer un rôle par défaut si nécessaire
    for (const user of users.users) {
      // Si pas de rôle défini OU si le rôle contient une valeur invalide
      if (!user.app_metadata?.role || !['admin', 'client', 'sfd_admin', 'user'].includes(user.app_metadata.role)) {
        // Par défaut, attribuer le rôle "client" à l'app_metadata
        const metadataRole = 'client';
        
        console.log(`Mise à jour du rôle metadata pour ${user.email || user.id} vers 'client'`);
        
        const { error } = await supabase.auth.admin.updateUserById(
          user.id,
          { app_metadata: { ...user.app_metadata, role: metadataRole } }
        );

        if (error) {
          console.error(`Erreur lors de la mise à jour du rôle pour l'utilisateur ${user.id}:`, error);
          continue;
        }

        updatedCount++;
        updatedUsers.push({
          id: user.id,
          email: user.email,
          role: metadataRole
        });
      } else {
        console.log(`L'utilisateur ${user.email || user.id} a déjà le rôle metadata: ${user.app_metadata?.role}`);
      }
    }

    // Créer également les entrées dans la table user_roles pour tous les utilisateurs
    for (const user of users.users) {
      // Map client role to user role in the database
      const metadataRole = user.app_metadata?.role || 'client';
      const dbRole = metadataRole === 'client' ? 'user' : metadataRole;
      
      console.log(`Vérification du rôle en base de données pour ${user.email || user.id}: ${dbRole}`);
      
      // Vérifier si l'entrée existe déjà
      const { data: existingRoles, error: checkError } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id)
        .eq('role', dbRole);
        
      if (checkError) {
        console.error(`Erreur lors de la vérification des rôles pour l'utilisateur ${user.id}:`, checkError);
        continue;
      }
      
      // Si l'entrée n'existe pas, la créer
      if (!existingRoles || existingRoles.length === 0) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .upsert({
            user_id: user.id,
            role: dbRole,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,role' });
          
        if (roleError) {
          console.error(`Erreur lors de la création de l'entrée user_roles pour ${user.id}:`, roleError);
        } else {
          userRolesCount++;
          console.log(`Rôle ${dbRole} ajouté pour l'utilisateur ${user.email || user.id}`);
        }
      } else {
        console.log(`L'utilisateur ${user.email || user.id} a déjà le rôle ${dbRole} en base de données`);
      }
    }

    // Activer les tables avec RLS si nécessaire
    const tables = [
      'client_activities',
      'client_adhesion_requests', 
      'client_documents',
      'loan_activities',
      'loan_payments',
      'meref_loan_requests'
    ];
    
    for (const table of tables) {
      try {
        // Activer RLS sur la table
        await supabase.rpc('enable_rls_for_table', { table_name: table });
        console.log(`RLS activé pour la table ${table}`);
      } catch (error) {
        console.log(`Impossible d'activer RLS pour ${table}. La fonction RPC n'existe peut-être pas ou la table est déjà configurée.`);
      }
    }

    // Retourner un rapport de synchronisation
    return new Response(
      JSON.stringify({
        success: true,
        message: `Synchronisation terminée. ${updatedCount} utilisateurs et ${userRolesCount} rôles en base de données mis à jour.`,
        updated_users: updatedUsers
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
