
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
    
    console.log(`Fetching SFDs for userId: ${userId || 'not provided'}`);
    
    // First approach: Get all active SFDs
    const { data: activeSfds, error: sfdsError } = await supabase
      .from('sfds')
      .select(`
        id,
        name,
        code,
        region,
        status,
        logo_url
      `)
      .eq('status', 'active');
      
    if (sfdsError) {
      console.error('Error fetching SFDs:', sfdsError);
      throw sfdsError;
    }
    
    console.log(`Found ${activeSfds?.length || 0} active SFDs in database`);
    
    // Si aucune SFD active, log explicite
    if (!activeSfds || activeSfds.length === 0) {
      console.log('ATTENTION: Aucune SFD avec le statut "active" n\'a été trouvée dans la base de données.');
    } else {
      // Log les SFDs actives trouvées
      console.log('SFDs actives trouvées:', activeSfds.map(sfd => `${sfd.name} (${sfd.id}) - status: ${sfd.status}`));
    }
    
    // Get SFDs that have associated admins to ensure they're valid for clients
    const { data: sfdsWithAdmins, error: adminsError } = await supabase
      .from('user_sfds')
      .select(`
        sfd_id,
        user:user_id (
          id,
          roles:user_roles(role)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (adminsError) {
      console.error('Error fetching SFD admins:', adminsError);
      // Continue with just active SFDs if there's an error
    }
    
    // Filter to only include SFDs with admin users
    const validSfdIds = new Set();
    
    if (sfdsWithAdmins && sfdsWithAdmins.length > 0) {
      sfdsWithAdmins.forEach(item => {
        // Check if user has sfd_admin role
        const hasAdminRole = item.user?.roles?.some(
          (r: any) => r.role === 'sfd_admin' || r.role === 'admin'
        );
        
        if (hasAdminRole && item.sfd_id) {
          validSfdIds.add(item.sfd_id);
        }
      });
      
      console.log(`Found ${validSfdIds.size} SFDs with admin associations`);
    }
    
    // If we found valid SFDs with admins, filter active SFDs to only include those
    let validSfds = activeSfds;
    if (validSfdIds.size > 0) {
      validSfds = activeSfds.filter(sfd => validSfdIds.has(sfd.id));
      console.log(`Filtered to ${validSfds.length} active SFDs with admins`);
    }

    // If no valid SFDs found and we're in development, provide test data
    if ((!validSfds || validSfds.length === 0) && Deno.env.get('ENVIRONMENT') === 'development') {
      console.log('No valid SFDs found, returning test data for development');
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
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
    
    // Fallback: If still no valid SFDs, use all active SFDs
    if (!validSfds || validSfds.length === 0) {
      console.log('No valid SFDs with admins found, using all active SFDs as fallback');
      validSfds = activeSfds;
    }

    // Format SFDs data for response
    const formattedSfds = validSfds.map(sfd => ({
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

    console.log(`Returning ${sortedSfds.length} SFDs to client`);
    
    return new Response(
      JSON.stringify(sortedSfds),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
    
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
