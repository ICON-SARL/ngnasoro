
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Récupérer les données d'entrée
    const { userId, sfdId } = await req.json()

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Créer un client Supabase avec la clé d'API
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Vérifier si l'utilisateur a un rôle admin
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const isAdmin = userRoles && userRoles.some(r => r.role === 'admin')
    const isSfdAdmin = userRoles && userRoles.some(r => r.role === 'sfd_admin')

    // Si ce n'est ni un admin ni un admin SFD, on retourne les demandes de l'utilisateur
    if (!isAdmin && !isSfdAdmin) {
      const { data: userRequests, error: userReqError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (userReqError) {
        console.error('Error fetching user adhesion requests:', userReqError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user adhesion requests' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      return new Response(
        JSON.stringify(userRequests),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Pour les admins SFD, vérifier qu'ils ont accès à cette SFD
    let canAccessSfd = isAdmin // Super admin peut tout voir
    
    if (!canAccessSfd && isSfdAdmin && sfdId) {
      const { data: userSfds, error: sfdError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId)

      if (!sfdError && userSfds) {
        canAccessSfd = userSfds.some(us => us.sfd_id === sfdId)
      }
    }

    if (!canAccessSfd && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to adhesion requests' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Récupérer les demandes d'adhésion
    let query = supabase
      .from('client_adhesion_requests')
      .select(`
        *,
        sfds:sfd_id(name)
      `)
      .order('created_at', { ascending: false })

    // Si c'est un admin SFD, filtrer par SFD
    if (isSfdAdmin && !isAdmin && sfdId) {
      query = query.eq('sfd_id', sfdId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching adhesion requests:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch adhesion requests' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    // Formater les données
    const formattedRequests = data.map(req => ({
      ...req,
      sfd_name: req.sfds?.name
    }))

    return new Response(
      JSON.stringify(formattedRequests),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ error: 'Server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
