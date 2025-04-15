import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.8.0'

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

    // Get the authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError) {
      throw new Error('Unauthorized: ' + userError.message)
    }

    // Handle different operations based on the request
    const { action, data } = await req.json()
    
    // For getting SFD accounts info (only approved SFDs)
    if (action === 'getSfdAccounts') {
      const sfdId = data?.sfdId;
      
      // Validate sfdId is not empty
      if (!sfdId || sfdId === '') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'SFD ID is required and cannot be empty'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      console.log(`Fetching approved SFD accounts for user: ${user.id} and SFD: ${sfdId}`);
      
      // Get SFDs that have approved this client
      // First check if the user has any approved client records
      const { data: approvedClients, error: clientsError } = await supabaseClient
        .from('sfd_clients')
        .select(`
          id,
          sfd_id,
          status,
          sfds (
            id,
            name,
            code,
            region,
            logo_url
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'validated');

      if (clientsError) {
        console.error('Failed to fetch approved SFD clients:', clientsError.message);
        throw new Error('Failed to fetch approved SFD clients: ' + clientsError.message);
      }
      
      console.log(`Found ${approvedClients?.length || 0} approved SFD clients`);
      
      if (!approvedClients || approvedClients.length === 0) {
        // User has no approved SFDs yet
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: [],
            message: 'No approved SFDs found'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Convert approved clients to user_sfds format
      const userSfds = approvedClients.map(client => ({
        id: crypto.randomUUID(),
        is_default: false,
        sfds: client.sfds
      }));
      
      // If there are approved SFDs, make the first one default
      if (userSfds.length > 0) {
        userSfds[0].is_default = true;
        
        // Create user_sfds entries if they don't exist
        approvedClients.forEach(async (client) => {
          // Check if entry already exists
          const { data: existingEntry } = await supabaseClient
            .from('user_sfds')
            .select('id')
            .eq('user_id', user.id)
            .eq('sfd_id', client.sfd_id)
            .single();
            
          if (!existingEntry) {
            // Create the entry
            await supabaseClient
              .from('user_sfds')
              .insert({
                user_id: user.id,
                sfd_id: client.sfd_id,
                is_default: false // Will update default separately
              });
          }
        });
        
        // Update the first one as default
        await supabaseClient
          .from('user_sfds')
          .update({ is_default: true })
          .eq('user_id', user.id)
          .eq('sfd_id', approvedClients[0].sfd_id);
      }
      
      // Get account balances for each SFD
      const sfdAccounts = await Promise.all(userSfds.map(async (userSfd) => {
        // Get account balance
        const { data: account, error: accountError } = await supabaseClient
          .from('accounts')
          .select('balance, currency')
          .eq('user_id', user.id)
          .eq('sfd_id', userSfd.sfds.id)
          .single();
          
        const balance = account ? account.balance : 0;
        const currency = account ? account.currency : 'FCFA';
        
        return {
          id: userSfd.sfds.id,
          name: userSfd.sfds.name,
          code: userSfd.sfds.code,
          region: userSfd.sfds.region || '',
          logoUrl: userSfd.sfds.logo_url,
          isDefault: userSfd.is_default,
          balance,
          currency
        };
      }));
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: sfdAccounts 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For synchronizing SFD accounts (keep only approved ones)
    if (action === 'synchronizeSfdAccounts') {
      const { forceSync, sfdId } = data || {};
      
      // Validate sfdId is not empty
      if (!sfdId || sfdId === '') {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'SFD ID is required and cannot be empty'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      let success = false;
      let message = 'No accounts to synchronize';
      
      console.log(`Synchronizing SFD accounts for user: ${user.id}`);
      
      // Get all approved SFDs for this user
      const { data: approvedClients, error: clientsError } = await supabaseClient
        .from('sfd_clients')
        .select('sfd_id')
        .eq('user_id', user.id)
        .eq('status', 'validated');
        
      if (clientsError) {
        throw new Error('Failed to fetch approved clients: ' + clientsError.message);
      }
      
      if (approvedClients && approvedClients.length > 0) {
        console.log(`Found ${approvedClients.length} approved SFDs to synchronize`);
        
        for (const client of approvedClients) {
          // Check if the account exists
          const { data: accountExists, error: existsError } = await supabaseClient
            .from('accounts')
            .select('id')
            .eq('user_id', user.id)
            .eq('sfd_id', client.sfd_id)
            .single();
            
          if (!accountExists || forceSync) {
            // Create or update the account
            console.log(`Creating/updating account for SFD: ${client.sfd_id}`);
            
            try {
              const { data: account, error: accountError } = await supabaseClient
                .rpc('sync_client_accounts', {
                  p_sfd_id: client.sfd_id,
                  p_client_id: user.id
                });
                
              if (!accountError) {
                success = true;
                message = 'Accounts synchronized successfully';
              } else {
                console.error('Error syncing account:', accountError.message);
              }
            } catch (syncError) {
              console.error('Failed to sync account:', syncError);
              
              // Try direct insert if RPC fails
              try {
                const { error: insertError } = await supabaseClient
                  .from('accounts')
                  .insert({
                    user_id: user.id,
                    sfd_id: client.sfd_id,
                    balance: 0,
                    currency: 'FCFA'
                  });
                  
                if (!insertError) {
                  success = true;
                  message = 'Accounts created successfully';
                }
              } catch (insertError) {
                console.error('Failed to create account directly:', insertError);
              }
            }
          } else {
            console.log(`Account already exists for SFD: ${client.sfd_id}`);
            success = true;
            message = 'Accounts already synchronized';
          }
        }
      } else {
        console.log('No approved SFDs found for this user');
      }
      
      return new Response(
        JSON.stringify({ 
          success: success,
          message: message
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For requesting SFD access (adhesion request)
    if (action === 'requestSfdAccess') {
      const { sfdId, phoneNumber } = data;
      
      // Check if user already has a pending request
      const { data: existingRequest, error: requestError } = await supabaseClient
        .from('client_adhesion_requests')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('sfd_id', sfdId)
        .single();
        
      if (existingRequest) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'You already have a request for this SFD'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Get user's profile for full name
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('full_name, avatar_url, email')
        .eq('id', user.id)
        .single();
      
      // Create a new adhesion request
      const { data: newRequest, error: createError } = await supabaseClient
        .from('client_adhesion_requests')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: profile?.full_name || '',
          email: profile?.email || user.email,
          phone: phoneNumber || null,
          status: 'pending'
        })
        .select();
        
      if (createError) {
        throw new Error('Failed to create adhesion request: ' + createError.message);
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: newRequest
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ success: false, message: 'Unknown action or invalid parameters' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
})
