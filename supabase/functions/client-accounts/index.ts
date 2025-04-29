
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the session from the auth header
    const {
      data: { session },
    } = await supabaseClient.auth.getSession()

    if (!session) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Parse the request body
    const { action, clientId, amount, description, limit, performedBy } = await req.json()

    // Handle different actions
    switch (action) {
      case 'getBalance': {
        // Get the client's account balance
        const { data: account, error } = await supabaseClient
          .from('accounts')
          .select('balance, currency')
          .eq('user_id', clientId)
          .single()

        if (error) throw error

        return new Response(
          JSON.stringify(account || { balance: 0, currency: 'FCFA' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'updateBalance': {
        if (!clientId || !amount) {
          throw new Error('Client ID and amount are required')
        }

        // First get the client user_id from sfd_clients table
        const { data: client, error: clientError } = await supabaseClient
          .from('sfd_clients')
          .select('user_id')
          .eq('id', clientId)
          .single()

        if (clientError) throw clientError
        if (!client?.user_id) throw new Error('Client has no associated user account')

        const userId = client.user_id

        // Update balance using SQL functions to ensure atomicity and constraints
        const { data, error } = await supabaseClient.rpc(
          'update_account_balance',
          { p_user_id: userId, p_amount: amount }
        )

        if (error) throw error

        // Record the transaction
        const { error: transactionError } = await supabaseClient
          .from('transactions')
          .insert({
            user_id: userId,
            amount: Math.abs(amount),
            type: amount > 0 ? 'deposit' : 'withdrawal',
            name: amount > 0 ? 'Crédit' : 'Débit',
            description: description || (amount > 0 ? 'Crédit manuel' : 'Débit manuel'),
            status: 'success',
            reference_id: `manual-${Date.now()}`
          })

        if (transactionError) throw transactionError

        // Log the operation
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: performedBy,
            action: amount > 0 ? 'credit_account' : 'debit_account',
            category: 'CLIENT_ACCOUNTS',
            status: 'success',
            severity: 'info',
            target_resource: `accounts/${userId}`,
            details: {
              client_id: clientId,
              amount: amount,
              description: description
            }
          })

        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      case 'getTransactions': {
        if (!clientId) {
          throw new Error('Client ID is required')
        }

        // First get the client user_id from sfd_clients table
        const { data: client, error: clientError } = await supabaseClient
          .from('sfd_clients')
          .select('user_id')
          .eq('id', clientId)
          .single()

        if (clientError) throw clientError
        if (!client?.user_id) throw new Error('Client has no associated user account')

        const userId = client.user_id

        // Get transactions for this user
        const { data: transactions, error } = await supabaseClient
          .from('transactions')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit || 10)

        if (error) throw error

        return new Response(
          JSON.stringify(transactions || []),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      default:
        throw new Error(`Unsupported action: ${action}`)
    }
  } catch (error) {
    console.error('Error processing request:', error.message)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
