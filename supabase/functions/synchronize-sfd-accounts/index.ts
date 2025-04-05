
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // Get the request body
    const { userId, sfdId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log(`Synchronizing SFD accounts for user ${userId}${sfdId ? `, focusing on SFD ${sfdId}` : ''}`)

    // Get the user's SFDs
    const { data: userSfds, error: sfdsError } = await supabase
      .from('user_sfds')
      .select(`
        id,
        sfd_id,
        is_default,
        sfds:sfd_id(id, name)
      `)
      .eq('user_id', userId)
      .conditionalFilter(sfdId ? `sfd_id.eq.${sfdId}` : '')

    if (sfdsError) {
      throw new Error(`Error fetching user SFDs: ${sfdsError.message}`)
    }

    if (!userSfds || userSfds.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No SFD accounts found for this user' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404
        }
      )
    }

    console.log(`Found ${userSfds.length} SFD accounts for user ${userId}`)

    // In a real application, here we would make API calls to the SFD systems
    // to get the latest balance information.
    // For this demo, we'll simulate updated balances

    // Record of successful updates
    const updates = []

    for (const sfd of userSfds) {
      // Simulate an API call to the SFD
      console.log(`Synchronizing account with SFD: ${sfd.sfds.name}`)
      
      // Generate a random balance update (would be real balance from SFD API in production)
      // This is just for demonstration purposes
      const newBalance = Math.floor(Math.random() * 100000) + 150000
      
      // In a real app, we would update the user's account balance in our database
      // based on the data received from the SFD's API

      // For this demo, let's update the account balance in the database
      const { error: updateError } = await supabase
        .from('accounts')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', userId)

      if (updateError) {
        console.error(`Error updating account for SFD ${sfd.sfds.name}:`, updateError)
      } else {
        updates.push({
          sfdId: sfd.sfd_id,
          name: sfd.sfds.name,
          newBalance
        })
      }
    }

    // Return the updates that were made
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'SFD accounts synchronized successfully',
        updates
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error handling request:', error)
    
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
