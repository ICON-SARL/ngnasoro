
// This edge function will be accessible via RPC
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      }
    })
  }

  try {
    // Create supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Parse request body
    const { sfd_id } = await req.json()
    
    if (!sfd_id) {
      return new Response(JSON.stringify({
        error: 'SFD ID is required'
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // Query for SFD stats
    const { data, error } = await supabase
      .from('sfd_stats')
      .select('*')
      .eq('sfd_id', sfd_id)
      .maybeSingle()

    // If no stats found, return default structure
    if (error || !data) {
      return new Response(JSON.stringify({
        id: null,
        sfd_id,
        total_clients: 0,
        total_loans: 0,
        repayment_rate: 0,
        last_updated: new Date().toISOString()
      }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Return the stats
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
