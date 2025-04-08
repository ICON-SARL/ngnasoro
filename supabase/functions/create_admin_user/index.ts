
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
    const { email, password, full_name, role, sfd_id } = await req.json();
    
    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating admin user with email: ${email} and role: ${role}`);
    
    // 1. Create user in auth system
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        sfd_id: sfd_id || null
      }
    });

    if (userError) {
      console.error("Error creating user:", userError);
      return new Response(
        JSON.stringify({ error: `Error creating user: ${userError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!userData.user) {
      return new Response(
        JSON.stringify({ error: "Failed to create user" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`User created successfully with ID: ${userData.user.id}`);

    // 2. Create admin_users entry
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userData.user.id,
        email,
        full_name,
        role,
        has_2fa: false
      })
      .select()
      .single();

    if (adminError) {
      console.error("Error creating admin user:", adminError);
      // Try to clean up the auth user since the admin_users entry failed
      await supabase.auth.admin.deleteUser(userData.user.id);
      
      return new Response(
        JSON.stringify({ error: `Error creating admin user: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Admin user created successfully");

    // 3. Assign role
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: userData.user.id,
        role
      }
    );

    if (roleError) {
      console.warn("Error assigning role:", roleError);
      // Non-critical, continue
    } else {
      console.log(`Role ${role} assigned successfully`);
    }

    // 4. If SFD ID is provided, create user-SFD association for SFD admins
    if (role === 'sfd_admin' && sfd_id) {
      const { error: sfdAssociationError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: userData.user.id,
          sfd_id,
          is_default: true
        });

      if (sfdAssociationError) {
        console.warn("Error creating user-SFD association:", sfdAssociationError);
        // Non-critical, continue
      } else {
        console.log(`Associated user with SFD ID: ${sfd_id}`);
      }
    }

    // Success response
    return new Response(
      JSON.stringify({
        success: true,
        user_id: userData.user.id,
        message: "Admin user created successfully"
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ error: `Error creating admin user: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
