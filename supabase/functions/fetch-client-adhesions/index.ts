
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
    
    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { userId, sfdId } = body;
    
    if (!userId) {
      throw new Error("User ID is required");
    }
    
    console.log(`Fetching client adhesion requests for admin user: ${userId}`);
    
    // First, determine which SFD this admin user is associated with
    if (!sfdId) {
      console.log("No SFD ID provided, attempting to find default SFD for user");
      
      // Find the admin's default SFD
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();
        
      if (sfdsError && sfdsError.code !== 'PGRST116') { // Ignore "No rows returned" error
        console.error('Error fetching user default SFD:', sfdsError);
        throw sfdsError;
      }
      
      // If no default SFD found, try to get any SFD
      if (!userSfds) {
        const { data: anySfd, error: anySfdError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userId)
          .limit(1)
          .single();
          
        if (anySfdError && anySfdError.code !== 'PGRST116') {
          console.error('Error fetching any user SFD:', anySfdError);
          throw anySfdError;
        }
        
        if (!anySfd) {
          console.log('No SFD associated with this admin user');
          return new Response(
            JSON.stringify({ data: [], message: "No SFD associated with this admin user" }),
            { 
              status: 200, 
              headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
            }
          );
        }
        
        console.log(`Found associated SFD: ${anySfd.sfd_id}`);
        
        // Now fetch adhesion requests for this SFD
        const { data: requests, error: requestsError } = await supabase
          .from('client_adhesion_requests')
          .select(`
            *,
            sfds:sfd_id(name)
          `)
          .eq('sfd_id', anySfd.sfd_id)
          .order('created_at', { ascending: false });
          
        if (requestsError) {
          console.error('Error fetching client adhesion requests:', requestsError);
          throw requestsError;
        }
        
        // Format the data to include sfd name
        const formattedRequests = requests?.map(req => ({
          ...req,
          sfd_name: req.sfds?.name
        })) || [];
        
        console.log(`Found ${formattedRequests.length || 0} client adhesion requests for SFD ${anySfd.sfd_id}`);
        
        return new Response(
          JSON.stringify(formattedRequests),
          { 
            status: 200, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      console.log(`Found default SFD: ${userSfds.sfd_id}`);
      
      // Fetch adhesion requests for the default SFD
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name)
        `)
        .eq('sfd_id', userSfds.sfd_id)
        .order('created_at', { ascending: false });
        
      if (requestsError) {
        console.error('Error fetching client adhesion requests:', requestsError);
        throw requestsError;
      }
      
      // Format the data to include sfd name
      const formattedRequests = requests?.map(req => ({
        ...req,
        sfd_name: req.sfds?.name
      })) || [];
      
      console.log(`Found ${formattedRequests.length || 0} client adhesion requests for default SFD ${userSfds.sfd_id}`);
      
      return new Response(
        JSON.stringify(formattedRequests),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    } else {
      // SFD ID was provided, fetch adhesion requests for this specific SFD
      console.log(`Fetching adhesion requests for specified SFD: ${sfdId}`);
      
      const { data: requests, error: requestsError } = await supabase
        .from('client_adhesion_requests')
        .select(`
          *,
          sfds:sfd_id(name)
        `)
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
        
      if (requestsError) {
        console.error('Error fetching client adhesion requests:', requestsError);
        throw requestsError;
      }
      
      // Format the data to include sfd name
      const formattedRequests = requests?.map(req => ({
        ...req,
        sfd_name: req.sfds?.name
      })) || [];
      
      console.log(`Found ${formattedRequests.length || 0} client adhesion requests for SFD ${sfdId}`);
      
      return new Response(
        JSON.stringify(formattedRequests),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }
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
