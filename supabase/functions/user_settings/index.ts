
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

  // Parse request URL to get path components
  const url = new URL(req.url)
  const path = url.pathname.split('/').filter(Boolean)
  const action = path[1] // e.g., "get" or "update"

  try {
    if (req.method === 'GET') {
      // Handle GET requests for user settings
      if (action === 'settings') {
        const { data, error } = await supabaseClient
          .from('user_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') { // PGRST116 means no rows returned
          throw error
        }

        return new Response(
          JSON.stringify({ data: data || { notifications: null, language: 'fr' } }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      } else if (action === 'security') {
        const { data, error } = await supabaseClient
          .from('security_settings')
          .select('*')
          .eq('user_id', user.id)
          .single()

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        return new Response(
          JSON.stringify({ 
            data: data || { 
              two_factor_auth: false, 
              biometric_auth: false, 
              sms_auth: true 
            } 
          }),
          { headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        )
      }
    } else if (req.method === 'POST') {
      // Handle POST requests for updating settings
      const requestData = await req.json()

      if (action === 'settings') {
        const { notifications, language } = requestData

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
      } else if (action === 'security') {
        const { two_factor_auth, biometric_auth, sms_auth } = requestData

        const { data, error } = await supabaseClient
          .from('security_settings')
          .upsert({
            user_id: user.id,
            two_factor_auth,
            biometric_auth,
            sms_auth
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

    // If we get here, the action was not recognized
    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    )
  }
})
