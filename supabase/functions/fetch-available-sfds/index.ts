
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the service key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Parse request body
    const { userId } = await req.json().catch(() => ({}));
    
    console.log(`Fetching available SFDs${userId ? ` for user: ${userId}` : ''}`);
    
    // 1. Fetch all active SFDs from the database
    const { data: activeSfds, error: sfdsError } = await supabase
      .from('sfds')
      .select('id, name, code, region, status, logo_url, description')
      .eq('status', 'active');
      
    if (sfdsError) {
      console.error('Error fetching SFDs:', sfdsError);
      throw sfdsError;
    }
    
    console.log(`Found ${activeSfds?.length || 0} active SFDs in database`);
    
    // Log each SFD for debugging
    activeSfds?.forEach(sfd => {
      console.log(`SFD: ${sfd.name} (${sfd.id}), Status: ${sfd.status}`);
    });
    
    // 2. If no SFDs found, check if there are any SFDs in DB regardless of status
    if (!activeSfds || activeSfds.length === 0) {
      console.log('No active SFDs found, checking all SFDs');
      
      const { data: allSfds, error: allSfdsError } = await supabase
        .from('sfds')
        .select('id, name, code, region, status');
        
      if (allSfdsError) {
        console.error('Error fetching all SFDs:', allSfdsError);
      } else {
        console.log(`Found ${allSfds?.length || 0} total SFDs in database`);
        console.log('SFDs with non-active status:', allSfds?.filter(sfd => sfd.status !== 'active'));
      }
    }
    
    // 3. If userId is provided, filter out SFDs the user already has
    if (userId) {
      // Check user's existing SFDs
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
      } else if (userSfds && userSfds.length > 0) {
        console.log(`User is already associated with ${userSfds.length} SFDs`);
        
        // Extract the SFD IDs the user already has
        const userSfdIds = userSfds.map(us => us.sfd_id);
        console.log('User SFD IDs:', userSfdIds);
        
        // Filter out SFDs the user already has
        const availableSfds = activeSfds?.filter(sfd => !userSfdIds.includes(sfd.id)) || [];
        console.log(`After filtering, ${availableSfds.length} SFDs are available to join`);
        
        // Return the filtered SFDs
        return new Response(
          JSON.stringify(availableSfds),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }
    
    // If no user-specific filtering or no user SFDs found, return all active SFDs
    if (activeSfds && activeSfds.length > 0) {
      return new Response(
        JSON.stringify(activeSfds),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // No SFDs found? Return test data for development
    const isDevEnvironment = Deno.env.get('ENVIRONMENT') === 'development';
    
    if (isDevEnvironment) {
      console.log('Returning test data for development environment');
      return new Response(
        JSON.stringify([
          {
            id: 'test-sfd1',
            name: 'RMCR (Test)',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            logo_url: null
          },
          {
            id: 'test-sfd2',
            name: 'NYESIGISO (Test)',
            code: 'NYESIGISO',
            region: 'Sud',
            status: 'active',
            logo_url: null
          }
        ]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Last resort: return empty array with a detailed log
    console.log('WARNING: No SFDs available for client selection');
    return new Response(
      JSON.stringify([]),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
