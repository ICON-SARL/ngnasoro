
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

    // Vérifier les rôles et permissions de l'utilisateur
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)

    if (rolesError) {
      console.error('Error fetching user roles:', rolesError)
      return new Response(
        JSON.stringify({ error: 'Failed to verify user permissions', details: rolesError }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const isAdmin = userRoles?.some(r => r.role === 'admin')
    const isSfdAdmin = userRoles?.some(r => r.role === 'sfd_admin')

    console.log(`User roles: ${JSON.stringify(userRoles)}`)
    console.log(`Is admin: ${isAdmin}, Is SFD admin: ${isSfdAdmin}`)

    // Si ce n'est ni un admin ni un admin SFD, on retourne uniquement les demandes de l'utilisateur
    if (!isAdmin && !isSfdAdmin) {
      const { data: userRequests, error: userReqError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name, logo_url)
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (userReqError) {
        console.error('Error fetching user adhesion requests:', userReqError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch user adhesion requests', details: userReqError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Formater les données
      const formattedRequests = userRequests.map(req => ({
        ...req,
        sfd_name: req.sfds?.name
      }))

      return new Response(
        JSON.stringify(formattedRequests),
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

      if (sfdError) {
        console.error('Error fetching user SFDs:', sfdError)
        return new Response(
          JSON.stringify({ error: 'Failed to verify SFD access permissions', details: sfdError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      if (userSfds) {
        canAccessSfd = userSfds.some(us => us.sfd_id === sfdId)
        console.log(`User can access SFD ${sfdId}: ${canAccessSfd}`)
      }
    }

    if (!canAccessSfd && !isAdmin) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access to adhesion requests' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Récupérer les demandes d'adhésion avec filtrage approprié
    let query = supabase
      .from('client_adhesion_requests')
      .select(`
        *,
        sfds:sfd_id(name, logo_url)
      `)
      .order('created_at', { ascending: false })

    // Si c'est un admin SFD et pas un super admin, et qu'un sfdId est spécifié, filtrer par SFD
    if (isSfdAdmin && !isAdmin && sfdId) {
      query = query.eq('sfd_id', sfdId)
    } else if (isSfdAdmin && !isAdmin && !sfdId) {
      // Si c'est un admin SFD sans sfdId spécifié, récupérer tous les SFDs auxquels il a accès
      const { data: accessibleSfds, error: accessError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId)

      if (accessError) {
        console.error('Error fetching accessible SFDs:', accessError)
        return new Response(
          JSON.stringify({ error: 'Failed to fetch accessible SFDs', details: accessError }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      if (accessibleSfds && accessibleSfds.length > 0) {
        const sfdIds = accessibleSfds.map(s => s.sfd_id)
        query = query.in('sfd_id', sfdIds)
      } else {
        // Si aucun SFD accessible, retourner un tableau vide
        return new Response(
          JSON.stringify([]),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching adhesion requests:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch adhesion requests', details: error }),
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
