
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
    // Create a Supabase client with the service role key (has admin privileges)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { admin_id, email, full_name, role, sfd_id, is_primary } = await req.json();
    
    if (!admin_id || !email || !full_name || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating admin user: ${email} for SFD ${sfd_id}`);

    // 1. Insert into admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: admin_id,
        email: email,
        full_name: full_name,
        role: 'sfd_admin',
        has_2fa: false
      })
      .select()
      .single();
    
    if (adminError) {
      console.error("Error inserting admin user:", adminError);
      throw adminError;
    }
    
    console.log("Admin user created:", adminData);
    
    // 2. Assign SFD_ADMIN role using RPC
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: admin_id,
        role: 'sfd_admin'
      }
    );

    if (roleError) {
      console.error("Error assigning role:", roleError);
      throw roleError;
    }

    // 3. Store SFD association in a join table if needed
    // This would be implemented if you have a specific sfd_admins table
    
    return new Response(
      JSON.stringify({ 
        success: true,
        admin_id: admin_id,
        message: "SFD admin created successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Error creating SFD admin: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
