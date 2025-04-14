
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { userId } = await req.json();
    
    // Get all active SFDs that have associated admins
    const { data: activeSfds, error: sfdsError } = await supabase
      .from('sfds')
      .select(`
        id,
        name,
        code,
        region,
        status,
        logo_url,
        user_sfds!inner(user_id)
      `)
      .eq('status', 'active');
      
    if (sfdsError) {
      console.error('Error fetching SFDs:', sfdsError);
      throw sfdsError;
    }

    // If no active SFDs found and we're in development, provide test data
    if ((!activeSfds || activeSfds.length === 0) && Deno.env.get('ENVIRONMENT') === 'development') {
      console.log('No active SFDs found, returning test data');
      return new Response(
        JSON.stringify([
          {
            id: 'test-sfd1',
            name: 'RMCR (Test)',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            logo_url: null
          }
        ]),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Format SFDs data for response
    const formattedSfds = activeSfds.map(sfd => ({
      id: sfd.id,
      name: sfd.name,
      code: sfd.code,
      region: sfd.region,
      status: sfd.status,
      logo_url: sfd.logo_url
    }));

    // Sort SFDs to prioritize RMCR
    const sortedSfds = formattedSfds.sort((a, b) => {
      if (a.name.toLowerCase().includes('rmcr')) return -1;
      if (b.name.toLowerCase().includes('rmcr')) return 1;
      return a.name.localeCompare(b.name);
    });

    return new Response(
      JSON.stringify(sortedSfds),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
