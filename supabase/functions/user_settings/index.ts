
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.29.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  // Get the Authorization header from the request
  const authHeader = req.headers.get('Authorization')
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: 'Missing Authorization header' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  // Create Supabase client with the auth header
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    { global: { headers: { Authorization: authHeader } } }
  )

  // Get the user ID from the JWT
  const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
  if (userError || !user) {
    return new Response(
      JSON.stringify({ error: 'Invalid token or user not found' }),
      { status: 401, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }

  try {
    // Parse JSON body
    const requestData = await req.json()
    const action = requestData.action || 'settings' // Default to settings
    const method = requestData.method || 'GET' // Default to GET
    
    console.log(`Processing ${method} request for ${action} by user ${user.id}`)

    if (action === 'settings') {
      if (method === 'GET') {
        // Get user settings
        const { data, error } = await supabaseClient
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error
        }

        // Return default settings if not found
        const defaultSettings = {
          notifications: {
            push: true,
            email: false,
            sms: true,
            sound: true
          },
          language: 'fr'
        }

        return new Response(
          JSON.stringify({ 
            data: data || defaultSettings
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      } else if (method === 'POST') {
        // Update user settings
        const { notifications, language } = requestData

        // Validate input
        if (!notifications || typeof language !== 'string') {
          return new Response(
            JSON.stringify({ error: 'Invalid input parameters' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          )
        }

        const { data, error } = await supabaseClient
          .from('user_settings')
          .upsert({
            user_id: user.id,
            notifications,
            language
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ data }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
    } else if (action === 'security') {
      if (method === 'GET') {
        // Get security settings
        const { data, error } = await supabaseClient
          .from('security_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        // Return default settings if not found
        const defaultSettings = {
          two_factor_auth: false,
          biometric_auth: false,
          sms_auth: true
        }

        return new Response(
          JSON.stringify({ 
            data: data || defaultSettings
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      } else if (method === 'POST') {
        // Update security settings
        const { two_factor_auth, biometric_auth, sms_auth } = requestData

        // Validate input (at least one parameter must be provided)
        if (two_factor_auth === undefined && biometric_auth === undefined && sms_auth === undefined) {
          return new Response(
            JSON.stringify({ error: 'At least one security setting must be provided' }),
            { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
          )
        }

        const { data, error } = await supabaseClient
          .from('security_settings')
          .upsert({
            user_id: user.id,
            two_factor_auth: two_factor_auth !== undefined ? two_factor_auth : false,
            biometric_auth: biometric_auth !== undefined ? biometric_auth : false,
            sms_auth: sms_auth !== undefined ? sms_auth : true
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify({ data }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
    }

    // If we get here, the action or method was not recognized
    return new Response(
      JSON.stringify({ error: 'Invalid action or method' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    console.error('Error in user_settings function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
