
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { admin_id } = await req.json();
    
    if (!admin_id) {
      return new Response(
        JSON.stringify({ error: "Admin ID is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleting admin user with ID: ${admin_id}`);

    // 1. Remove user-SFD associations first
    const { error: userSfdsError } = await supabase
      .from('user_sfds')
      .delete()
      .eq('user_id', admin_id);

    if (userSfdsError) {
      console.warn("Error removing user-SFD associations:", userSfdsError);
      // Non-critical, continue
    }

    // 2. Remove user roles
    const { error: userRolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', admin_id);

    if (userRolesError) {
      console.warn("Error removing user roles:", userRolesError);
      // Non-critical, continue
    }

    // 3. Remove admin user record
    const { error: adminUserError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', admin_id);

    if (adminUserError) {
      console.error("Error removing admin user:", adminUserError);
      return new Response(
        JSON.stringify({ error: `Error removing admin user: ${adminUserError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Delete the actual auth user (this must be done last)
    const { error: authUserError } = await supabase.auth.admin.deleteUser(admin_id);

    if (authUserError) {
      console.error("Error deleting auth user:", authUserError);
      return new Response(
        JSON.stringify({ error: `Error deleting auth user: ${authUserError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Success response
    return new Response(
      JSON.stringify({ success: true, message: "SFD admin deleted successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: `Error deleting SFD admin: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
