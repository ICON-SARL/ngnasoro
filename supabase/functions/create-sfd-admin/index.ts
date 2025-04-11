
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

    // Extract data from request
    const { email, password, full_name, role, sfd_id, notify } = await req.json();
    
    console.log("Received request to create SFD admin:", { 
      email, 
      full_name, 
      role, 
      sfd_id, 
      notify,
      hasPassword: !!password 
    });
    
    // Validate required fields
    if (!email || !password || !full_name || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 1. Create auth user with admin privileges
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        sfd_id
      },
      app_metadata: {
        role: 'sfd_admin'
      }
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ error: `Error creating auth user: ${authError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: "No user created" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = authData.user.id;
    console.log("User created successfully with ID:", userId);

    // 2. Create entry in admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email,
        full_name,
        role: 'sfd_admin',
        has_2fa: false
      });

    if (adminError) {
      console.error("Error creating admin user record:", adminError);
      return new Response(
        JSON.stringify({ error: `Error creating admin user record: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Admin user record created");

    // 3. Assign SFD_ADMIN role
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: userId,
        role: 'sfd_admin'
      }
    );

    if (roleError) {
      console.error("Error assigning role:", roleError);
      return new Response(
        JSON.stringify({ error: `Error assigning role: ${roleError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("SFD_ADMIN role assigned");

    // 4. Create association with SFD
    const { error: assocError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: userId,
        sfd_id: sfd_id,
        is_default: true
      });

    if (assocError) {
      console.error("Error creating SFD association:", assocError);
      return new Response(
        JSON.stringify({ error: `Error creating SFD association: ${assocError.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("SFD association created");

    // 5. Send notification if requested (simplified for now)
    if (notify) {
      console.log("Should send notification to:", email);
      // Notification logic would go here
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: userId,
          email,
          full_name,
          role: 'sfd_admin'
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
