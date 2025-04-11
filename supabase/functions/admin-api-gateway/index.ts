
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Map of base URLs for different admin backends
const apiBaseUrls = {
  meref: Deno.env.get('MEREF_API_URL') || 'https://api.meref.example.com',
  sfd: Deno.env.get('SFD_ADMIN_API_URL') || 'https://api.sfd-admin.example.com'
}

// Admin API Gateway for handling requests to various backend admin systems
Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    
    // Create a Supabase client with the Auth context of the logged-in user
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: req.headers.get('Authorization')! },
      },
    })

    // Get the authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw new Error('Authentication required: ' + (userError?.message || 'No user found'))
    }

    // Get user roles to determine access permissions
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
    
    if (rolesError) {
      throw new Error('Failed to verify user roles: ' + rolesError.message)
    }

    const roles = userRoles?.map(r => r.role) || []
    const isAdmin = roles.includes('admin')
    const isSfdAdmin = roles.includes('sfd_admin')

    if (!isAdmin && !isSfdAdmin) {
      return new Response(
        JSON.stringify({ success: false, message: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Get the request body with endpoint info and payload
    const { endpoint, method = 'GET', data = null } = await req.json()

    if (!endpoint) {
      throw new Error('API endpoint is required')
    }

    // Determine which backend to route to based on user role and endpoint
    let apiUrl
    let apiKey

    if (isAdmin) {
      // Super admin can access both MEREF and SFD admin APIs
      if (endpoint.startsWith('/sfds')) {
        apiUrl = `${apiBaseUrls.sfd}${endpoint}`
        apiKey = Deno.env.get('SFD_ADMIN_API_KEY') || ''
      } else {
        apiUrl = `${apiBaseUrls.meref}${endpoint}`
        apiKey = Deno.env.get('MEREF_API_KEY') || ''
      }
    } else if (isSfdAdmin) {
      // SFD admin can only access SFD admin API for their SFD
      // Get the SFD ID associated with this admin
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .eq('is_default', true)
        .single()
      
      if (sfdsError || !userSfds) {
        throw new Error('No SFD association found for this admin')
      }

      const sfdId = userSfds.sfd_id
      apiUrl = `${apiBaseUrls.sfd}/sfds/${sfdId}${endpoint}`
      apiKey = Deno.env.get('SFD_ADMIN_API_KEY') || ''
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Insufficient permissions' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 403 }
      )
    }

    // Forward the request to the appropriate backend API
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'X-User-ID': user.id
      }
    }

    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      fetchOptions.body = JSON.stringify(data)
    }

    console.log(`Forwarding ${method} request to: ${apiUrl}`)
    const response = await fetch(apiUrl, fetchOptions)
    const responseData = await response.json()

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: responseData.message || 'API request failed',
          error: responseData.error || response.statusText,
          status: response.status
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      )
    }

    // Audit log the API call
    await supabase
      .from('audit_logs')
      .insert({
        user_id: user.id,
        action: `api_${method.toLowerCase()}`,
        category: isAdmin ? 'meref_admin' : 'sfd_admin',
        severity: 'info',
        status: 'success',
        target_resource: endpoint,
        details: { endpoint, method }
      })

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Admin API Gateway error:', error.message)
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
