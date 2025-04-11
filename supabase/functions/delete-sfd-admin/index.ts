
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
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("Missing environment variables");
      return new Response(
        JSON.stringify({ error: "Server configuration incorrect" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a Supabase client with the service key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract admin ID from request
    const { adminId } = await req.json();
    
    if (!adminId) {
      return new Response(
        JSON.stringify({ error: "Admin ID is required" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log(`Processing deletion for admin ID: ${adminId}`);
    
    // First, remove the admin from user_sfds
    const { error: sfdAssocError } = await supabase
      .from('user_sfds')
      .delete()
      .eq('user_id', adminId);
      
    if (sfdAssocError) {
      console.error("Error removing SFD association:", sfdAssocError);
      // Continue with deletion even if this fails
    }
    
    // Then remove the admin from user_roles
    const { error: rolesError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', adminId);
      
    if (rolesError) {
      console.error("Error removing user roles:", rolesError);
      // Continue with deletion even if this fails
    }
    
    // Remove from admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', adminId);
      
    if (adminError) {
      console.error("Error removing from admin_users:", adminError);
      // Continue with auth user deletion even if this fails
    }
    
    // Finally, delete the auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(adminId);
    
    if (authError) {
      console.error("Error deleting auth user:", authError);
      return new Response(
        JSON.stringify({ error: `Error deleting auth user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    console.log("SFD admin deleted successfully");
    
    return new Response(
      JSON.stringify({ success: true, message: "SFD admin deleted successfully" }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error in deleteSfdAdmin:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
