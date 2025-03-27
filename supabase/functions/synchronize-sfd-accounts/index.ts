
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
  const supabaseServiceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  
  // Create Supabase client with anon key (for user-level access)
  const supabase = createClient(supabaseUrl, supabaseAnonKey)
  
  // Create admin Supabase client with service role (for admin-level access)
  const adminSupabase = createClient(supabaseUrl, supabaseServiceRole)

  try {
    // Get the request body
    const { userId, sfdId } = await req.json()

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

    let targetSfdId = sfdId
    if (!targetSfdId && userSfds && userSfds.length > 0) {
      // If no specific SFD was provided, use the default one
      const defaultSfd = userSfds.find(sfd => sfd.is_default)
      if (defaultSfd) {
        targetSfdId = defaultSfd.sfd_id
      } else {
        targetSfdId = userSfds[0].sfd_id
      }
    }

    // For the targeted SFD, update the account balance
    // In a real app, this would fetch data from the SFD's API
    // Here we simulate this with existing data from the admin panel
    
    // First, check if there's any admin data for this SFD and user combination
    const { data: adminData, error: adminError } = await adminSupabase
      .from('sfd_clients')
      .select(`
        id,
        full_name,
        sfd_loans(id, amount, status, next_payment_date, disbursed_at, monthly_payment) 
      `)
      .eq('user_id', userId)
      .eq('sfd_id', targetSfdId)
      .single()

    if (adminError && adminError.code !== 'PGRST116') { // Not found is ok
      console.warn('Admin data fetch error:', adminError)
    }

    // Update the user's account - using fixed value for demonstration
    // In production this would come from the SFD's actual data
    const balance = adminData ? 250000 : 150000 + Math.floor(Math.random() * 100000)
    
    const { error: updateError } = await supabase
      .from('accounts')
      .update({ 
        balance: balance,
        last_updated: new Date().toISOString() 
      })
      .eq('user_id', userId)
      
    if (updateError) {
      throw updateError
    }
    
    // Create transaction records for synchronization
    const { error: transactionError } = await adminSupabase
      .from('transactions')
      .upsert([
        {
          user_id: userId,
          sfd_id: targetSfdId,
          name: 'Synchronisation compte',
          type: 'deposit',
          amount: 0, // Just a marker transaction, no real amount change
          date: new Date().toISOString(),
          status: 'success',
          description: 'Synchronisation du compte avec la SFD'
        }
      ])

    if (transactionError) {
      console.error('Transaction record error:', transactionError)
    }

    // Log the synchronization
    await adminSupabase
      .from('audit_logs')
      .insert({
        user_id: userId,
        action: 'synchronize_sfd_account',
        category: 'ACCOUNT_SYNC',
        status: 'success',
        severity: 'info',
        details: { 
          sfd_id: targetSfdId,
          synchronized_at: new Date().toISOString()
        }
      })

    return new Response(
      JSON.stringify({
        success: true,
        message: 'SFD accounts synchronized successfully',
        data: {
          sfdId: targetSfdId,
          balance: balance
        }
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
