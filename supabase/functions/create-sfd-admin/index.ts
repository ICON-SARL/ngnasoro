
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
    console.log('Starting create-sfd-admin function')
    
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
      console.error('No Authorization header found')
      throw new Error('Authentification requise')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Auth error or no user:', authError)
      throw new Error('Utilisateur non authentifié')
    }

    console.log('Authenticated user:', user.id, 'checking roles...')

    // Vérifier que l'utilisateur a le rôle d'admin
    const { data: roles, error: rolesError } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .in('role', ['admin'])
      .maybeSingle()

    if (rolesError) {
      console.error('Error fetching roles:', rolesError)
      throw new Error(`Erreur lors de la vérification des rôles: ${rolesError.message}`)
    }

    if (!roles) {
      console.error('User does not have admin role:', user.id)
      throw new Error('Vous n\'avez pas les permissions nécessaires (rôle admin requis)')
    }

    console.log('User has admin role, proceeding...')

    // Récupération des données
    const requestData = await req.json()
    const adminData = requestData.adminData
    
    console.log('Request payload structure:', Object.keys(requestData))
    
    if (!adminData || !adminData.email || !adminData.password || !adminData.full_name || !adminData.sfd_id) {
      console.error('Invalid admin data:', adminData ? Object.keys(adminData) : 'null')
      throw new Error('Données d\'administrateur incomplètes')
    }

    console.log('Creating admin user for SFD:', adminData.sfd_id)

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
      console.error('Error creating user:', createUserError)
      throw new Error(`Erreur lors de la création de l'utilisateur: ${createUserError?.message}`)
    }

    console.log('Created auth user:', authUser.user.id)

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
      console.error('Error inserting admin user record:', adminError)
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
      console.error('Error assigning role:', roleError)
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
      console.error('Error associating with SFD:', sfdAssocError)
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

    console.log('Successfully created SFD admin:', authUser.user.id)

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
