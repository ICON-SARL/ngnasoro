
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

    // Parse the request body to get sfdId
    const { sfdId } = await req.json();
    
    if (!sfdId) {
      return new Response(
        JSON.stringify({ error: "SFD ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching administrators for SFD: ${sfdId}`);
    
    // First get the user_ids associated with this SFD from user_sfds
    const { data: userSfds, error: userSfdsError } = await supabase
      .from('user_sfds')
      .select('user_id')
      .eq('sfd_id', sfdId);
      
    if (userSfdsError) {
      console.error('Error fetching user-SFD associations:', userSfdsError);
      return new Response(
        JSON.stringify({ error: userSfdsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    if (!userSfds || userSfds.length === 0) {
      console.log(`No administrators found for SFD: ${sfdId}`);
      return new Response(
        JSON.stringify([]),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract user IDs
    const userIds = userSfds.map(item => item.user_id);
    
    // Now fetch the admin details from admin_users
    const { data: admins, error: adminsError } = await supabase
      .from('admin_users')
      .select('id, email, full_name, role, has_2fa, last_sign_in_at')
      .in('id', userIds);
      
    if (adminsError) {
      console.error('Error fetching admin details:', adminsError);
      return new Response(
        JSON.stringify({ error: adminsError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Successfully retrieved ${admins?.length || 0} admins for SFD ${sfdId}`);
    
    return new Response(
      JSON.stringify(admins || []),
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
