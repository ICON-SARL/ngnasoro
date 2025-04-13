
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Vérification de l'authentification
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Vérification d'authentification et d'autorisation (MEREF/admin uniquement)
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authentification requise')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Utilisateur non authentifié')
    }

    // Vérifier que l'utilisateur a le rôle d'admin
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin'])
      .maybeSingle()

    if (rolesError) {
      throw new Error(`Erreur lors de la vérification des rôles: ${rolesError.message}`)
    }

    if (!roles) {
      throw new Error('Vous n\'avez pas les permissions nécessaires (rôle admin requis)')
    }

    // Récupération des données
    const { adminData } = await req.json()

    if (!adminData || !adminData.email || !adminData.password || !adminData.full_name || !adminData.sfd_id) {
      throw new Error('Données d\'administrateur incomplètes')
    }

    // 1. Créer l'utilisateur dans auth.users
    const { data: authUser, error: createUserError } = await supabaseClient.auth.admin.createUser({
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
    })

    if (createUserError || !authUser.user) {
      throw new Error(`Erreur lors de la création de l'utilisateur: ${createUserError?.message}`)
    }

    // 2. Stocker les informations administrateur
    const { error: adminError } = await supabaseClient
      .from('admin_users')
      .insert({
        id: authUser.user.id,
        email: adminData.email,
        full_name: adminData.full_name,
        role: 'sfd_admin',
        has_2fa: false
      })

    if (adminError) {
      // Si erreur, essayer de supprimer l'utilisateur auth créé pour éviter des utilisateurs orphelins
      await supabaseClient.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Erreur lors de la création de l'enregistrement admin: ${adminError.message}`)
    }

    // 3. Attribuer le rôle sfd_admin
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .insert({
        user_id: authUser.user.id,
        role: 'sfd_admin'
      })

    if (roleError) {
      // Nettoyage en cas d'erreur
      await supabaseClient.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Erreur lors de l'attribution du rôle: ${roleError.message}`)
    }

    // 4. Associer l'administrateur à la SFD
    const { error: sfdAssocError } = await supabaseClient
      .from('user_sfds')
      .insert({
        user_id: authUser.user.id,
        sfd_id: adminData.sfd_id,
        is_default: true
      })

    if (sfdAssocError) {
      // Nettoyage en cas d'erreur
      await supabaseClient.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Erreur lors de l'association à la SFD: ${sfdAssocError.message}`)
    }

    // 5. Journaliser l'action pour audit
    await supabaseClient
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: 'create_sfd_admin',
        category: 'ADMIN_MANAGEMENT',
        severity: 'info',
        status: 'success',
        target_resource: `admin_users/${authUser.user.id}`,
        details: {
          created_admin_id: authUser.user.id,
          created_admin_email: adminData.email,
          sfd_id: adminData.sfd_id
        }
      })

    // 6. Notification à l'administrateur si demandé
    if (adminData.notify) {
      // Code pour envoyer un email à l'administrateur avec ses identifiants
      // (Non implémenté dans cette version - nécessiterait un service externe)
      console.log(`Notification should be sent to ${adminData.email}`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        admin: {
          id: authUser.user.id,
          email: adminData.email,
          full_name: adminData.full_name,
          sfd_id: adminData.sfd_id
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 201 
      }
    )
  } catch (error) {
    console.error('Error in create-sfd-admin function:', error)
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Une erreur est survenue lors de la création de l\'administrateur SFD'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
