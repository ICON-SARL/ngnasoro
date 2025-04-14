
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
    
    // Get the request body - with better error handling
    let body;
    try {
      body = await req.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid JSON body' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    let { userId, sfdId, forceSync } = body;
    
    // Ensure sfdId is never an empty string - null is better for database queries
    if (sfdId === '') {
      console.log('Empty sfdId received, converting to null');
      sfdId = null;
    }
    
    // If no userId provided, check auth header
    if (!userId) {
      // Verify authentication
      const authHeader = req.headers.get('Authorization')
      if (!authHeader) {
        console.error('No userId provided and missing Authorization header')
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Missing user identification' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400
          }
        )
      }
      
      // Get the JWT token
      const token = authHeader.replace('Bearer ', '')
      
      // Verify the user's identity
      const { data: { user }, error: authError } = await supabase.auth.getUser(token)
      
      if (authError || !user) {
        console.error('Authentication error or missing user:', authError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Authentication failed' 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 401
          }
        )
      }
      
      userId = user.id
    }

    if (!userId) {
      console.error('Still no userId after authentication attempts')
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Unable to determine user ID' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      )
    }

    console.log(`Synchronizing SFD accounts for user ${userId}${sfdId ? `, focusing on SFD ${sfdId}` : ''}${forceSync ? ', forcing full sync' : ''}`)
    
    // Special handling for development mode
    if (Deno.env.get('ENVIRONMENT') === 'development') {
      console.log('Development mode detected, returning sample data');
      
      // Create sample accounts for development
      try {
        // If sfdId is provided and not empty, ensure an account exists for it
        if (sfdId) {
          // Check if sfd exists
          const { data: sfd } = await adminClient
            .from('sfds')
            .select('id, name')
            .eq('id', sfdId)
            .maybeSingle();
            
          if (sfd) {
            // Check if account exists
            const { data: existingAccount } = await adminClient
              .from('accounts')
              .select('id')
              .eq('user_id', userId)
              .eq('sfd_id', sfdId)
              .maybeSingle();
              
            // Create account if doesn't exist
            if (!existingAccount) {
              await adminClient
                .from('accounts')
                .insert({
                  user_id: userId,
                  sfd_id: sfdId,
                  balance: 250000,
                  currency: 'FCFA',
                  updated_at: new Date().toISOString()
                });
                
              console.log(`Created development account for SFD ${sfd.name}`);
            } else {
              console.log(`Development account already exists for SFD ${sfd.name}`);
            }
            
            return new Response(
              JSON.stringify({ 
                success: true, 
                message: 'Development account synchronized',
                updates: [{
                  sfdId: sfdId,
                  name: sfd.name || 'Development SFD',
                  newBalance: 250000
                }]
              }),
              { 
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              }
            );
          }
        }
        
        // Otherwise return generic success for development
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Development accounts synchronized',
            updates: [
              {
                sfdId: 'rmcr-id',
                name: 'RMCR (Dev)',
                newBalance: 250000
              }
            ]
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      } catch (devError) {
        console.error('Error in development mode:', devError);
        // Continue with normal flow if development setup fails
      }
    }

    // 1. First get user's SFDs from user_sfds table or sfd_clients
    let userSfds = [];
    
    // Try to get SFDs from user_sfds first (for admins and validated users)
    const { data: directSfds, error: directError } = await adminClient
      .from('user_sfds')
      .select(`
        id,
        sfd_id,
        is_default,
        sfds:sfd_id(id, name, status)
      `)
      .eq('user_id', userId)
      .filter('sfds.status', 'eq', 'active');
      
    if (directError) {
      console.error('Error fetching user SFDs:', directError);
    } else if (directSfds && directSfds.length > 0) {
      userSfds = directSfds.filter(item => item.sfds !== null);
      console.log(`Found ${userSfds.length} SFDs from user_sfds table`);
    }
    
    // If no SFDs found in user_sfds, try sfd_clients (for regular clients)
    if (userSfds.length === 0) {
      const { data: clientSfds, error: clientError } = await adminClient
        .from('sfd_clients')
        .select(`
          id,
          sfd_id,
          status,
          sfds:sfd_id(id, name, status)
        `)
        .eq('user_id', userId)
        .eq('status', 'validated')
        .filter('sfds.status', 'eq', 'active');
        
      if (clientError) {
        console.error('Error fetching client SFDs:', clientError);
      } else if (clientSfds && clientSfds.length > 0) {
        userSfds = clientSfds.filter(item => item.sfds !== null)
          .map(item => ({
            id: item.id,
            sfd_id: item.sfd_id,
            is_default: false,
            sfds: item.sfds
          }));
        console.log(`Found ${userSfds.length} SFDs from sfd_clients table`);
      }
    }
    
    // If still no SFDs and specific sfdId provided, check if it exists
    if (userSfds.length === 0 && sfdId) {
      const { data: singleSfd, error: singleError } = await adminClient
        .from('sfds')
        .select('id, name, status')
        .eq('id', sfdId)
        .eq('status', 'active')
        .maybeSingle();
        
      if (!singleError && singleSfd) {
        userSfds = [{
          id: crypto.randomUUID(),
          sfd_id: singleSfd.id,
          is_default: true,
          sfds: singleSfd
        }];
        console.log(`Using provided SFD: ${singleSfd.name}`);
      }
    }

    if (userSfds.length === 0) {
      console.log(`No SFD accounts found for user ${userId}`);
      
      // For clients without SFDs, try to provide default SFD
      const { data: defaultSfd } = await adminClient
        .from('sfds')
        .select('id, name')
        .eq('status', 'active')
        .ilike('name', '%rmcr%')
        .limit(1)
        .maybeSingle();
        
      if (defaultSfd) {
        console.log(`Using default RMCR SFD: ${defaultSfd.name}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Using default SFD',
            updates: [{
              sfdId: defaultSfd.id,
              name: defaultSfd.name,
              newBalance: 5000
            }]
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No SFD accounts found for this user',
          updates: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If sfdId is provided (and not null), filter to only that SFD
    if (sfdId) {
      userSfds = userSfds.filter(item => item.sfd_id === sfdId);
    }

    console.log(`Processing ${userSfds.length} SFD accounts for user ${userId}`);

    // Record of successful updates
    const updates = [];

    // First get existing balances to ensure consistency
    const { data: existingAccounts, error: accountsError } = await adminClient
      .from('accounts')
      .select('id, balance, sfd_id')
      .eq('user_id', userId);

    if (accountsError) {
      console.error("Error fetching existing accounts:", accountsError);
    }

    // Create a map of existing balances by SFD ID
    const balancesBySfd = new Map();
    if (existingAccounts) {
      existingAccounts.forEach(account => {
        if (account.sfd_id) {
          balancesBySfd.set(account.sfd_id, account.balance);
        }
      });
    }

    for (const sfd of userSfds) {
      if (!sfd.sfds || !sfd.sfd_id) {
        console.error(`Missing SFD data for entry ${sfd.id}, skipping`);
        continue;
      }
      
      // Log each SFD we're processing
      console.log(`Processing SFD account: ${sfd.sfds.name} (${sfd.sfd_id})`);
      
      // Use existing balance if available and not forcing sync
      let newBalance;
      if (!forceSync && balancesBySfd.has(sfd.sfd_id)) {
        newBalance = balancesBySfd.get(sfd.sfd_id);
        console.log(`Using existing balance for ${sfd.sfds.name}: ${newBalance}`);
      } else {
        // Generate consistent balances based on SFD ID
        // This ensures the same SFD always shows the same balance across the app
        const sfdIdSum = sfd.sfd_id.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
        newBalance = 75000 + (sfdIdSum % 7) * 25000;
        console.log(`Generated new balance for ${sfd.sfds.name}: ${newBalance}`);
      }

      try {
        // Check if account exists for this SFD
        const { data: existingAccount, error: accountError } = await adminClient
          .from('accounts')
          .select('id')
          .eq('user_id', userId)
          .eq('sfd_id', sfd.sfd_id)
          .maybeSingle();

        if (accountError) {
          console.error(`Error checking account for SFD ${sfd.sfds.name}:`, accountError);
          continue;
        }

        if (existingAccount) {
          // Update existing account
          const { error: updateError } = await adminClient
            .from('accounts')
            .update({ 
              balance: newBalance, 
              updated_at: new Date().toISOString() 
            })
            .eq('id', existingAccount.id);

          if (updateError) {
            console.error(`Error updating account for SFD ${sfd.sfds.name}:`, updateError);
          } else {
            console.log(`Updated account for SFD ${sfd.sfds.name}`);
            updates.push({
              sfdId: sfd.sfd_id,
              name: sfd.sfds.name,
              newBalance
            });
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
            });

          if (insertError) {
            console.error(`Error creating account for SFD ${sfd.sfds.name}:`, insertError);
          } else {
            console.log(`Created new account for SFD ${sfd.sfds.name}`);
            updates.push({
              sfdId: sfd.sfd_id,
              name: sfd.sfds.name,
              newBalance
            });
          }
        }
      } catch (sfdError) {
        console.error(`Unexpected error processing SFD ${sfd.sfds.name}:`, sfdError);
      }
    }

    // Return the updates that were made
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: updates.length > 0 ? 'SFD accounts synchronized successfully' : 'No updates required',
        updates
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error handling request:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: `Error handling request: ${error.message}` 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
