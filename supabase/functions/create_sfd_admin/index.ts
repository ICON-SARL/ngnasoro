
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
    const requestData = await req.json();
    
    console.log("Edge function received data:", {
      ...requestData,
      password: "***" // Hide password in logs
    });
    
    const { email, password, full_name, role, sfd_id, is_primary } = requestData;
    
    if (!email || !password || !full_name || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating admin user: ${email} for SFD ${sfd_id}`);

    // 1. Verify the SFD exists
    const { data: sfdData, error: sfdError } = await supabase
      .from('sfds')
      .select('id, name')
      .eq('id', sfd_id)
      .single();
      
    if (sfdError || !sfdData) {
      console.error("SFD not found:", sfdError);
      return new Response(
        JSON.stringify({ error: `SFD with ID ${sfd_id} not found` }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log(`Verified SFD exists: ${sfdData.name}`);

    // 2. Create user in auth system
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role: 'sfd_admin',
        sfd_id
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

    // 3. Insert into admin_users table
    const { data: adminData, error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userData.user.id,
        email,
        full_name,
        role: 'sfd_admin',
        has_2fa: false
      })
      .select()
      .single();
    
    if (adminError) {
      console.error("Error inserting admin user:", adminError);
      // Try to clean up the auth user since the admin_users entry failed
      await supabase.auth.admin.deleteUser(userData.user.id);
      
      return new Response(
        JSON.stringify({ error: `Error creating admin user: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Admin user created successfully");
    
    // 4. Assign SFD_ADMIN role
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: userData.user.id,
        role: 'sfd_admin'
      }
    );

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Non-critical, continue
    } else {
      console.log("SFD admin role assigned successfully");
    }

    // 5. Create an entry in user_sfds table to associate the admin with the SFD
    const { error: userSfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userData.user.id,
        sfd_id: sfd_id,
        is_default: true
      });
      
    if (userSfdError) {
      console.warn("Error creating user-SFD association:", userSfdError);
      // Continue despite error - not critical
    } else {
      console.log("User-SFD association created successfully");
    }

    // Success response
    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: userData.user.id,
        message: "SFD admin created successfully" 
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate"
        } 
      }
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
