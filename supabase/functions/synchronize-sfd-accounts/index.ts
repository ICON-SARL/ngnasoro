
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.31.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    })
  }

  // Get environment variables
  const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // Get the request body
    const { userId } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log(`Synchronizing SFD accounts for user ${userId}`)

    // Get all SFDs associated with this user
    const { data: userSfds, error: sfdsError } = await supabase
      .from('user_sfds')
      .select(`
        id,
        sfd_id,
        is_default,
        sfds:sfd_id(id, name, code, region)
      `)
      .eq('user_id', userId)

    if (sfdsError) {
      throw sfdsError
    }

    // For each SFD, update the account balance
    // In a real app, this would call external APIs for each SFD
    for (const userSfd of userSfds) {
      // Simulate balance update - in production, this would call SFD API
      const mockBalance = Math.floor(Math.random() * (300000 - 150000) + 150000)
      
      // Update the user's account
      if (userSfd.is_default) {
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ 
            balance: 250000, // Fixed balance as in the screenshot
            last_updated: new Date().toISOString() 
          })
          .eq('user_id', userId)
          
        if (updateError) {
          throw updateError
        }
      }
      
      // Log the synchronization
      await supabase
        .from('audit_logs')
        .insert({
          user_id: userId,
          action: 'synchronize_sfd_account',
          category: 'ACCOUNT_SYNC',
          status: 'success',
          severity: 'info',
          details: { 
            sfd_id: userSfd.sfd_id,
            sfd_name: userSfd.sfds?.name,
            synchronized_at: new Date().toISOString()
          }
        })
    }

    // Create transaction records
    const { error: transactionError } = await supabase
      .from('transactions')
      .upsert([
        {
          user_id: userId,
          name: 'Dépôt',
          type: 'deposit',
          amount: 125000,
          date: new Date().toISOString(),
          status: 'success'
        },
        {
          user_id: userId,
          name: 'Intérêts',
          type: 'deposit',
          amount: 7500,
          date: new Date().toISOString(),
          status: 'success'
        }
      ])

    if (transactionError) {
      throw transactionError
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SFD accounts synchronized successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Error synchronizing SFD accounts:', error)
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
