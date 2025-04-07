
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

    const { admin_id } = await req.json();
    
    if (!admin_id) {
      return new Response(
        JSON.stringify({ error: "Missing admin_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Deleting admin user with ID: ${admin_id}`);

    // 1. Delete from admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', admin_id);
    
    if (adminError) {
      console.error("Error deleting admin user:", adminError);
      throw adminError;
    }
    
    // 2. Delete role assignment
    const { error: roleError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', admin_id)
      .eq('role', 'sfd_admin');
      
    if (roleError) {
      console.warn("Error deleting role:", roleError);
      // Continue despite error
    }
    
    // 3. Delete auth user if possible
    const { error: authError } = await supabase.auth.admin.deleteUser(admin_id);
    
    if (authError) {
      console.warn("Error deleting auth user:", authError);
      // Continue despite error
    }
    
    return new Response(
      JSON.stringify({ 
        success: true,
        message: "SFD admin deleted successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Error deleting SFD admin: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
