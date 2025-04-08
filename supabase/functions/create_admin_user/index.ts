
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
    
    console.log("Edge function received data:", requestData);
    
    const { email, full_name, role, sfd_id } = requestData;
    
    if (!email || !full_name || !role) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create a new user in auth
    const { data: userData, error: authError } = await supabase.auth.admin.createUser({
      email: email,
      password: requestData.password || null,
      email_confirm: true,
      user_metadata: {
        full_name: full_name,
        role: role,
        sfd_id: sfd_id
      }
    });

    if (authError) {
      console.error("Error creating auth user:", authError);
      return new Response(
        JSON.stringify({ error: `Error creating user: ${authError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const userId = userData.user.id;
    console.log("Auth user created successfully:", userId);

    // 2. Insert into admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: userId,
        email: email,
        full_name: full_name,
        role: role,
        has_2fa: false
      });

    if (adminError) {
      console.error("Error creating admin user:", adminError);
      return new Response(
        JSON.stringify({ error: `Error creating admin record: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // 3. Assign the role in user_roles table
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: userId,
        role: role
      }
    );

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Continue despite error - not critical
    }
    
    // 4. If it's an SFD admin, associate with the SFD
    if (role === 'sfd_admin' && sfd_id) {
      const { error: sfdAssocError } = await supabase
        .from('user_sfds')
        .insert({
          user_id: userId,
          sfd_id: sfd_id,
          is_default: true
        });
        
      if (sfdAssocError) {
        console.warn("Error associating admin with SFD:", sfdAssocError);
        // Continue despite error - not critical
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: userId,
        message: "Admin user created successfully" 
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Edge function error:", error);
    
    return new Response(
      JSON.stringify({ 
        error: `Error creating admin user: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
