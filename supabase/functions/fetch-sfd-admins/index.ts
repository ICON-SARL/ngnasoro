
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
    
    // First get the user_ids associated with this SFD from user_sfds using the service role to bypass RLS
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
    
    // Now fetch the admin details from profiles and user_roles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', userIds);
      
    if (profilesError) {
      console.error('Error fetching profiles:', profilesError);
      return new Response(
        JSON.stringify({ error: profilesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user roles
    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);
      
    if (rolesError) {
      console.error('Error fetching roles:', rolesError);
      return new Response(
        JSON.stringify({ error: rolesError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch auth users data (email, last_sign_in_at) using service role
    const { data: { users: authUsers }, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('Error fetching auth users:', authError);
      return new Response(
        JSON.stringify({ error: authError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a map for quick lookup
    const authUsersMap = new Map(authUsers.map(u => [u.id, u]));
    const rolesMap = new Map(rolesData?.map(r => [r.user_id, r.role]) || []);

    // Combine data to match the expected format
    const admins = profilesData?.filter(profile => userIds.includes(profile.id)).map(profile => {
      const authUser = authUsersMap.get(profile.id);
      const role = rolesMap.get(profile.id);
      
      return {
        id: profile.id,
        email: authUser?.email || '',
        full_name: profile.full_name || '',
        role: role || 'sfd_admin',
        has_2fa: false, // To be implemented later with 2FA system
        last_sign_in_at: authUser?.last_sign_in_at || null
      };
    }) || [];
    
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
