
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
    const { action, sfdId, data } = await req.json()
    
    // For getting SFD accounts info
    if (action === 'getSfdAccounts') {
      const { data: userSfds, error: sfdsError } = await supabaseClient
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id (
            id,
            name,
            code,
            region,
            logo_url
          )
        `)
        .eq('user_id', user.id);

      if (sfdsError) {
        throw new Error('Failed to fetch SFD accounts: ' + sfdsError.message)
      }
      
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
      )
    }
    
    // For requesting SFD access
    if (action === 'requestSfdAccess') {
      const { sfdId, phoneNumber } = data;
      
      // Check if user already has a pending request
      const { data: existingRequest, error: requestError } = await supabaseClient
        .from('sfd_clients')
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
        )
      }
      
      // Get user's profile for full name
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      // Create a new request
      const { data: newRequest, error: createError } = await supabaseClient
        .from('sfd_clients')
        .insert({
          user_id: user.id,
          sfd_id: sfdId,
          full_name: profile?.full_name || '',
          phone: phoneNumber || null,
          status: 'pending',
          kyc_level: 0
        })
        .select();
        
      if (createError) {
        throw new Error('Failed to create SFD request: ' + createError.message)
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          data: newRequest
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    // For synchronizing SFD accounts
    if (action === 'synchronizeSfdAccounts') {
      const { forceSync } = data || {};
      let success = false;
      
      // Get all SFDs associated with the user
      const { data: userSfds, error: sfdsError } = await supabaseClient
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id);
        
      if (sfdsError) {
        throw new Error('Failed to fetch user SFDs: ' + sfdsError.message)
      }
      
      if (userSfds && userSfds.length > 0) {
        for (const userSfd of userSfds) {
          // Check if the account exists
          const { data: accountExists, error: existsError } = await supabaseClient
            .from('accounts')
            .select('id')
            .eq('user_id', user.id)
            .eq('sfd_id', userSfd.sfd_id)
            .single();
            
          if (!accountExists || forceSync) {
            // Create or update the account
            const { data: account, error: accountError } = await supabaseClient
              .rpc('sync_client_accounts', {
                p_sfd_id: userSfd.sfd_id,
                p_client_id: user.id
              });
              
            if (!accountError) {
              success = true;
            }
          }
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: success,
          message: success ? 'Accounts synchronized successfully' : 'No accounts to synchronize'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    
    return new Response(
      JSON.stringify({ success: false, message: 'Unknown action' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
