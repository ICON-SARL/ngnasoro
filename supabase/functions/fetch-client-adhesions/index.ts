
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
    // Get input data
    const { userId, sfdId } = await req.json()

    if (!userId) {
      console.log('User ID missing in request')
      return new Response(
        JSON.stringify({ 
          error: 'User ID is required',
          success: false
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Create a Supabase client with the API key
    const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Debug log
    console.log(`Processing request for user: ${userId}, SFD: ${sfdId || 'Not specified'}`)

    // Check user roles and app metadata for permissions
    try {
      // First check user's app_metadata which might contain the role
      const { data: userData, error: userError } = await supabase
        .auth.admin.getUserById(userId)
      
      if (userError) {
        console.error('Error fetching user data:', userError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch user data', 
            details: userError,
            success: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      console.log('User data retrieved:', JSON.stringify(userData?.user?.app_metadata))
      
      // Get user roles from the database as well
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)

      if (rolesError) {
        console.error('Error fetching user roles:', rolesError)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to verify user permissions', 
            details: rolesError,
            success: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Get user_sfds associations to determine which SFDs this user can access
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId)

      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError)
      }

      // Check if the user is an admin or SFD admin
      const roles = userRoles?.map(r => r.role) || []
      const isAdmin = roles.includes('admin') || userData?.user?.app_metadata?.role === 'admin'
      const isSfdAdmin = roles.includes('sfd_admin') || userData?.user?.app_metadata?.role === 'sfd_admin'
      
      console.log(`User roles from database: ${JSON.stringify(roles)}`)
      console.log(`App metadata role: ${userData?.user?.app_metadata?.role}`)
      console.log(`Is admin: ${isAdmin}, Is SFD admin: ${isSfdAdmin}`)

      // If the user is a regular user (not admin/sfd_admin), return only their requests
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
            JSON.stringify({ 
              error: 'Failed to fetch user adhesion requests', 
              details: userReqError,
              success: false 
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
          )
        }

        // Format the results
        const formattedRequests = userRequests.map(req => ({
          ...req,
          sfd_name: req.sfds?.name
        }))

        return new Response(
          JSON.stringify({ data: formattedRequests, success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
      }

      // For SFD admins, check which SFDs they have access to
      let accessibleSfdIds: string[] = []
      
      if (!isAdmin && isSfdAdmin) {
        // Get the SFDs this admin has access to from user metadata
        const metadataSfdId = userData?.user?.user_metadata?.sfd_id
        
        if (metadataSfdId) {
          accessibleSfdIds.push(metadataSfdId)
        }
        
        // Also check the user_sfds table
        if (userSfds && userSfds.length > 0) {
          accessibleSfdIds = [...accessibleSfdIds, ...userSfds.map(s => s.sfd_id)]
        }
        
        // Check if admin is assigned directly in sfd_administrators table
        const { data: adminSfds, error: adminSfdsError } = await supabase
          .from('sfd_administrators')
          .select('sfd_id')
          .eq('user_id', userId)
        
        if (!adminSfdsError && adminSfds && adminSfds.length > 0) {
          accessibleSfdIds = [...accessibleSfdIds, ...adminSfds.map(s => s.sfd_id)]
        }
        
        console.log(`SFD Admin accessible SFDs: ${JSON.stringify(accessibleSfdIds)}`)
      }

      // For regular admins (and super admins), they can see all SFDs
      if (isAdmin) {
        // No filtering needed, they can see all
        accessibleSfdIds = [] // Empty means no filter
      }
      
      // Check if specific SFD was requested and admin has access to it
      let canAccessRequestedSfd = isAdmin // Super admins can access any SFD
      
      if (!canAccessRequestedSfd && isSfdAdmin && sfdId) {
        canAccessRequestedSfd = accessibleSfdIds.includes(sfdId)
        console.log(`SFD Admin requested SFD ${sfdId}, can access: ${canAccessRequestedSfd}`)
      }
      
      // If SFD admin doesn't have access to requested SFD
      if (isSfdAdmin && sfdId && !canAccessRequestedSfd) {
        return new Response(
          JSON.stringify({ 
            error: `Unauthorized access to SFD ${sfdId}`,
            success: false
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
        )
      }

      // Build query based on permissions
      let query = supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name, logo_url)
        `)
        .order('created_at', { ascending: false })

      // Apply SFD filtering based on permissions
      if (sfdId) {
        // If specific SFD requested, filter by it
        query = query.eq('sfd_id', sfdId)
      } else if (isSfdAdmin && !isAdmin && accessibleSfdIds.length > 0) {
        // If SFD admin and no specific SFD requested, filter by all accessible SFDs
        query = query.in('sfd_id', accessibleSfdIds)
      }
      // If admin with no specific SFD, no filtering needed

      // Execute the query
      const { data, error } = await query

      if (error) {
        console.error('Error fetching adhesion requests:', error)
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch adhesion requests', 
            details: error,
            success: false 
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        )
      }

      // Format the results
      const formattedRequests = data.map(req => ({
        ...req,
        sfd_name: req.sfds?.name
      }))

      return new Response(
        JSON.stringify({ data: formattedRequests, success: true }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      )
    } catch (permError) {
      console.error('Error checking permissions:', permError)
      return new Response(
        JSON.stringify({ 
          error: 'Failed to check user permissions', 
          details: permError.message,
          success: false 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
  } catch (error) {
    console.error('Server error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Server error', 
        details: error.message,
        success: false 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
