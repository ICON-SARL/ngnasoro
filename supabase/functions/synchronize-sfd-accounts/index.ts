
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
    const { userId, sfdId, forceSync } = await req.json()

    if (!userId) {
      throw new Error('User ID is required')
    }

    console.log(`Synchronizing SFD accounts for user ${userId}${sfdId ? `, focusing on SFD ${sfdId}` : ''}${forceSync ? ', forcing full sync' : ''}`)
    
    // Special handling for test accounts
    if (userId.includes('test')) {
      console.log('Test account detected, returning predefined SFD accounts')
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Test accounts synchronized',
          updates: [
            {
              sfdId: 'premier-sfd-id',
              name: 'Premier SFD',
              newBalance: 0
            },
            {
              sfdId: 'deuxieme-sfd-id',
              name: 'Deuxième SFD',
              newBalance: 0
            },
            {
              sfdId: 'troisieme-sfd-id',
              name: 'Troisième SFD',
              newBalance: 0
            }
          ]
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // First check for validated SFD client entries
    let validatedSfdClientsQuery = supabase
      .from('sfd_clients')
      .select(`
        id,
        sfd_id,
        status,
        sfds:sfd_id(id, name)
      `)
      .eq('user_id', userId)
      .eq('status', 'validated')
    
    // If sfdId is provided, add an additional filter
    if (sfdId) {
      validatedSfdClientsQuery = validatedSfdClientsQuery.eq('sfd_id', sfdId)
    }
    
    const { data: validatedSfdClients, error: clientError } = await validatedSfdClientsQuery
    
    if (clientError) {
      console.error('Error fetching validated client SFDs:', clientError)
      // Continue to check user_sfds as a fallback
    }
    
    // If we have validated clients, ensure they have corresponding user_sfds entries
    if (validatedSfdClients && validatedSfdClients.length > 0) {
      for (const client of validatedSfdClients) {
        // Check if an entry already exists in user_sfds
        const { data: existingSfd } = await supabase
          .from('user_sfds')
          .select('id')
          .eq('user_id', userId)
          .eq('sfd_id', client.sfd_id)
          .maybeSingle()
        
        // Create user_sfds entry if it doesn't exist
        if (!existingSfd) {
          await supabase
            .from('user_sfds')
            .insert({
              user_id: userId,
              sfd_id: client.sfd_id,
              is_default: false
            })
          
          console.log(`Created new user_sfds entry for validated client: ${client.sfds.name}`)
        }
      }
    }

    // Now get the user's SFDs from user_sfds table
    let userSfdsQuery = supabase
      .from('user_sfds')
      .select(`
        id,
        sfd_id,
        is_default,
        sfds:sfd_id(id, name)
      `)
      .eq('user_id', userId)
    
    // If sfdId is provided, add an additional filter
    if (sfdId) {
      userSfdsQuery = userSfdsQuery.eq('sfd_id', sfdId)
    }

    const { data: userSfds, error: sfdsError } = await userSfdsQuery

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

    // First get existing balances to ensure consistency
    const { data: existingAccounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, balance, sfd_id')
      .eq('user_id', userId)

    if (accountsError) {
      console.error("Error fetching existing accounts:", accountsError)
    }

    // Create a map of existing balances by SFD ID
    const balancesBySfd = new Map()
    if (existingAccounts) {
      existingAccounts.forEach(account => {
        if (account.sfd_id) {
          balancesBySfd.set(account.sfd_id, account.balance)
        }
      })
    }

    for (const sfd of userSfds) {
      // Simulate an API call to the SFD
      console.log(`Synchronizing account with SFD: ${sfd.sfds.name}`)
      
      // Use existing balance if available and not forcing sync
      let newBalance
      if (!forceSync && balancesBySfd.has(sfd.sfd_id)) {
        newBalance = balancesBySfd.get(sfd.sfd_id)
        console.log(`Using existing balance for ${sfd.sfds.name}: ${newBalance}`)
      } else {
        // Generate consistent balances based on SFD ID
        // This ensures the same SFD always shows the same balance across the app
        const sfdIdSum = sfd.sfd_id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
        newBalance = 50000 + (sfdIdSum % 5) * 30000
        console.log(`Generated new balance for ${sfd.sfds.name}: ${newBalance}`)
      }
      
      // In a real app, we would update the user's account balance in our database
      // based on the data received from the SFD's API

      // Check if account exists for this SFD
      const { data: existingAccount, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .eq('sfd_id', sfd.sfd_id)
        .maybeSingle()

      if (accountError) {
        console.error(`Error checking account for SFD ${sfd.sfds.name}:`, accountError)
        continue
      }

      if (existingAccount) {
        // Update existing account
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ 
            balance: newBalance, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', existingAccount.id)

        if (updateError) {
          console.error(`Error updating account for SFD ${sfd.sfds.name}:`, updateError)
        } else {
          updates.push({
            sfdId: sfd.sfd_id,
            name: sfd.sfds.name,
            newBalance
          })
        }
      } else {
        // Create new account if not exists
        const { error: insertError } = await supabase
          .from('accounts')
          .insert({
            user_id: userId,
            sfd_id: sfd.sfd_id,
            balance: newBalance,
            currency: 'FCFA',
            updated_at: new Date().toISOString()
          })

        if (insertError) {
          console.error(`Error creating account for SFD ${sfd.sfds.name}:`, insertError)
        } else {
          updates.push({
            sfdId: sfd.sfd_id,
            name: sfd.sfds.name,
            newBalance
          })
        }
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
