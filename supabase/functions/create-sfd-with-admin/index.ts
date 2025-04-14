
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Création du client supabase avec le rôle service_role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
    
    // Vérifier l'authentification si un token est fourni
    let userId = null;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
      
      if (!authError && user) {
        userId = user.id;
        
        // Vérifier si l'utilisateur est admin
        const { data: userRoles, error: roleError } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin');
        
        if (roleError || !userRoles || userRoles.length === 0) {
          return new Response(
            JSON.stringify({ error: 'Non autorisé: droits insuffisants' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      } else {
        return new Response(
          JSON.stringify({ error: 'Token invalide' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // Récupérer les données de la requête
    const { 
      sfdData, 
      createAdmin = false, 
      adminData = null,
      existingAdminId = null 
    } = await req.json();
    
    console.log('Creating SFD with data:', {
      sfdData,
      createAdmin,
      hasAdminData: !!adminData,
      existingAdminId
    });
    
    // Vérifier les données obligatoires pour la SFD
    if (!sfdData || !sfdData.name || !sfdData.code) {
      return new Response(
        JSON.stringify({ error: 'Données de SFD manquantes ou incomplètes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier les données de l'administrateur si createAdmin est true
    if (createAdmin && (!adminData || !adminData.email || !adminData.password || !adminData.full_name)) {
      return new Response(
        JSON.stringify({ error: 'Données d\'administrateur manquantes ou incomplètes' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Vérifier qu'on ne tente pas de faire les deux à la fois
    if (createAdmin && existingAdminId) {
      return new Response(
        JSON.stringify({ error: 'Impossible de créer un nouvel administrateur et d\'en associer un existant en même temps' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Créer la SFD
    const { data: newSfd, error: sfdError } = await supabaseAdmin
      .from('sfds')
      .insert({
        name: sfdData.name,
        code: sfdData.code,
        region: sfdData.region || null,
        status: sfdData.status || 'active',
        contact_email: sfdData.contact_email || null,
        phone: sfdData.phone || null,
        description: sfdData.description || null,
        logo_url: sfdData.logo_url || null
      })
      .select()
      .single();
    
    if (sfdError || !newSfd) {
      return new Response(
        JSON.stringify({ error: `Erreur lors de la création de la SFD: ${sfdError?.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const sfdId = newSfd.id;
    
    // Créer des statistiques pour la SFD
    const { error: statsError } = await supabaseAdmin
      .from('sfd_stats')
      .insert({
        sfd_id: sfdId,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0
      });
    
    if (statsError) {
      console.error('Erreur lors de la création des stats SFD:', statsError);
      // Non critique, on continue
    }
    
    let adminData2 = null;
    
    // Si createAdmin est true, créer l'administrateur
    if (createAdmin && adminData) {
      // 1. Créer l'utilisateur dans auth.users
      const { data: newUser, error: createUserError } = await supabaseAdmin.auth.admin.createUser({
        email: adminData.email,
        password: adminData.password,
        email_confirm: true,
        user_metadata: {
          full_name: adminData.full_name,
          sfd_id: sfdId
        },
        app_metadata: {
          role: 'sfd_admin'
        }
      });
      
      if (createUserError || !newUser.user) {
        // Erreur critique - rollback en supprimant la SFD
        await supabaseAdmin.from('sfds').delete().eq('id', sfdId);
        
        return new Response(
          JSON.stringify({ error: `Erreur lors de la création de l'administrateur: ${createUserError?.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const newAdminId = newUser.user.id;
      
      try {
        // 2. Créer l'entrée dans admin_users
        await supabaseAdmin
          .from('admin_users')
          .insert({
            id: newAdminId,
            email: adminData.email,
            full_name: adminData.full_name,
            role: 'sfd_admin',
            has_2fa: false
          });
        
        // 3. Assigner le rôle SFD_ADMIN
        await supabaseAdmin
          .from('user_roles')
          .insert({
            user_id: newAdminId,
            role: 'sfd_admin'
          });
        
        // 4. Créer l'association avec la SFD
        await supabaseAdmin
          .from('user_sfds')
          .insert({
            user_id: newAdminId,
            sfd_id: sfdId,
            is_default: true
          });
        
        adminData2 = {
          id: newAdminId,
          email: adminData.email,
          full_name: adminData.full_name,
          role: 'sfd_admin',
          sfd_id: sfdId
        };
      } catch (error) {
        // En cas d'erreur, essayer de supprimer l'utilisateur créé et la SFD
        await supabaseAdmin.auth.admin.deleteUser(newAdminId);
        await supabaseAdmin.from('sfds').delete().eq('id', sfdId);
        
        throw error;
      }
    } else if (existingAdminId) {
      // Vérifier si l'utilisateur existe et a le rôle sfd_admin
      const { data: existingAdmin, error: adminCheckError } = await supabaseAdmin
        .from('user_roles')
        .select('user_id, role')
        .eq('user_id', existingAdminId)
        .eq('role', 'sfd_admin')
        .single();
      
      if (adminCheckError || !existingAdmin) {
        // Erreur critique - rollback en supprimant la SFD
        await supabaseAdmin.from('sfds').delete().eq('id', sfdId);
        
        return new Response(
          JSON.stringify({ error: 'Administrateur SFD existant non trouvé ou rôle incorrect' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Créer l'association avec la SFD
      const { error: assocError } = await supabaseAdmin
        .from('user_sfds')
        .insert({
          user_id: existingAdminId,
          sfd_id: sfdId,
          is_default: false
        });
      
      if (assocError) {
        // Erreur critique - rollback en supprimant la SFD
        await supabaseAdmin.from('sfds').delete().eq('id', sfdId);
        
        return new Response(
          JSON.stringify({ error: `Erreur lors de l'association de l'administrateur existant: ${assocError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Récupérer les données de l'administrateur
      const { data: existingAdminData, error: adminDataError } = await supabaseAdmin
        .from('admin_users')
        .select('id, email, full_name, role')
        .eq('id', existingAdminId)
        .single();
      
      if (!adminDataError && existingAdminData) {
        adminData2 = {
          ...existingAdminData,
          sfd_id: sfdId
        };
      }
    }
    
    // Enregistrer un audit log
    if (userId) {
      await supabaseAdmin
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'create_sfd',
          target_resource: `sfds/${sfdId}`,
          category: 'SFD_OPERATIONS',
          severity: 'INFO',
          status: 'success',
          details: {
            sfd_id: sfdId,
            sfd_name: newSfd.name,
            with_admin: createAdmin || !!existingAdminId
          }
        });
    }
    
    // Retourner les informations de la SFD et de l'administrateur
    return new Response(
      JSON.stringify({
        success: true,
        sfd: newSfd,
        admin: adminData2
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Erreur dans create-sfd-with-admin:', error);
    
    return new Response(
      JSON.stringify({ error: `Erreur interne du serveur: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
