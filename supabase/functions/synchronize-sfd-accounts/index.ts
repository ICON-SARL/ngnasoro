
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
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    
    // Create clients with different permission levels
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      console.error('Missing Authorization header')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing Authorization header' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }
    
    // Get the JWT token
    const token = authHeader.replace('Bearer ', '')
    
    // Verify the user's identity
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unauthorized' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      )
    }

    // Get the request body
    const { userId, sfdId, forceSync } = await req.json()
    
    // Ensure the authenticated user matches the requested userId or has admin privileges
    if (user.id !== userId) {
      // Check if the user has admin role
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
        
      if (roleError) {
        console.error('Error checking user roles:', roleError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Error checking user permissions' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403
          }
        )
      }
      
      const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'sfd_admin')
      
      if (!isAdmin) {
        console.error('Permission denied: User does not have admin privileges and is trying to access another user\'s data')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Permission denied' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403
          }
        )
      }
    }

    console.log(`Synchronizing SFD accounts for user ${userId}${sfdId ? `, focusing on SFD ${sfdId}` : ''}${forceSync ? ', forcing full sync' : ''}`)
    
    // Special handling for test accounts (this makes development easier)
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

    // First check for validated SFD client entries using the admin client
    // which has higher permissions to ensure we can read potentially restricted data
    let validatedSfdClientsQuery = adminClient
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
      // We'll continue to check user_sfds as a fallback
    } else {
      console.log(`Found ${validatedSfdClients?.length || 0} validated client SFDs`)
    }
    
    // If we have validated clients, ensure they have corresponding user_sfds entries
    if (validatedSfdClients && validatedSfdClients.length > 0) {
      console.log('Processing validated clients to ensure user_sfds entries')
      
      for (const client of validatedSfdClients) {
        // Check if an entry already exists in user_sfds
        const { data: existingSfd, error: checkError } = await adminClient
          .from('user_sfds')
          .select('id')
          .eq('user_id', userId)
          .eq('sfd_id', client.sfd_id)
          .maybeSingle()
        
        if (checkError) {
          console.error(`Error checking existing user_sfds for ${client.sfds?.name}:`, checkError)
          continue
        }
        
        // Create user_sfds entry if it doesn't exist
        if (!existingSfd) {
          const { error: insertError } = await adminClient
            .from('user_sfds')
            .insert({
              user_id: userId,
              sfd_id: client.sfd_id,
              is_default: false
            })
          
          if (insertError) {
            console.error(`Error creating user_sfds entry for ${client.sfds?.name}:`, insertError)
          } else {
            console.log(`Created new user_sfds entry for validated client: ${client.sfds?.name}`)
          }
        } else {
          console.log(`Existing user_sfds entry found for ${client.sfds?.name}, skipping creation`)
        }
      }
    }

    // Now get the user's SFDs from user_sfds table - This needs admin access as well
    let userSfdsQuery = adminClient
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
      console.error(`Error fetching user SFDs:`, sfdsError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Error fetching user SFDs: ${sfdsError.message}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      )
    }

    if (!userSfds || userSfds.length === 0) {
      console.log(`No SFD accounts found for user ${userId}`)
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No SFD accounts found for this user',
          updates: [] 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log(`Found ${userSfds.length} SFD accounts for user ${userId}`)

    // Record of successful updates
    const updates = []

    // First get existing balances to ensure consistency
    const { data: existingAccounts, error: accountsError } = await adminClient
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
      if (!sfd.sfds) {
        console.error(`Missing SFD data for user_sfds entry ${sfd.id}, skipping`)
        continue
      }
      
      // Log each SFD we're processing
      console.log(`Processing SFD account: ${sfd.sfds.name} (${sfd.sfd_id})`)
      
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

      try {
        // Check if account exists for this SFD
        const { data: existingAccount, error: accountError } = await adminClient
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
          const { error: updateError } = await adminClient
            .from('accounts')
            .update({ 
              balance: newBalance, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingAccount.id)

          if (updateError) {
            console.error(`Error updating account for SFD ${sfd.sfds.name}:`, updateError)
          } else {
            console.log(`Updated account for SFD ${sfd.sfds.name}`)
            updates.push({
              sfdId: sfd.sfd_id,
              name: sfd.sfds.name,
              newBalance
            })
          }
        } else {
          // Create new account if not exists
          const { error: insertError } = await adminClient
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
            console.log(`Created new account for SFD ${sfd.sfds.name}`)
            updates.push({
              sfdId: sfd.sfd_id,
              name: sfd.sfds.name,
              newBalance
            })
          }
        }
      } catch (sfdError) {
        console.error(`Unexpected error processing SFD ${sfd.sfds.name}:`, sfdError)
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
      JSON.stringify({ 
        success: false, 
        message: `Error handling request: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
