
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
    const { userId } = await req.json()

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch active SFDs
    const { data: sfdsData, error: sfdsError } = await supabaseAdmin
      .from('sfds')
      .select('id, name, region, logo_url, code')
      .eq('status', 'active')
      .order('name')

    if (sfdsError) {
      throw sfdsError
    }

    let filteredSfds = sfdsData

    // If userId is provided, filter out SFDs the user is already associated with
    if (userId) {
      // Get user's existing SFD associations
      const { data: existingAssociations, error: associationError } = await supabaseAdmin
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId)

      if (associationError) {
        console.error('Error fetching user SFD associations:', associationError)
      } else {
        // Filter out SFDs the user already has
        const existingSfdIds = existingAssociations?.map(ea => ea.sfd_id) || []
        filteredSfds = sfdsData.filter(sfd => !existingSfdIds.includes(sfd.id))
      }
    }

    return new Response(
      JSON.stringify(filteredSfds),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    console.error('Error fetching SFDs:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
