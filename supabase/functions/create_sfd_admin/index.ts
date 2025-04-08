
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching
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
      password: requestData.password ? "***" : undefined
    });
    
    const { user_id, email, full_name, role, sfd_id } = requestData;
    
    if (!user_id || !email || !full_name || !sfd_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Creating admin user: ${email} with ID ${user_id} for SFD ${sfd_id}`);

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

    // 2. Insert directly into admin_users (bypassing RLS)
    const { data: adminData, error: adminError } = await supabase
      .rpc('create_admin_user', {
        admin_id: user_id,
        admin_email: email,
        admin_full_name: full_name,
        admin_role: role || 'sfd_admin'
      });
    
    if (adminError) {
      console.error("Error inserting admin user:", adminError);
      return new Response(
        JSON.stringify({ error: `Error creating admin user: ${adminError.message}` }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Admin user created successfully");
    
    // 3. Assign SFD_ADMIN role
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user_id,
        role: 'sfd_admin'
      });

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Non-critical, continue
    } else {
      console.log("SFD admin role assigned successfully");
    }

    // 4. Create an entry in user_sfds table to associate the admin with the SFD
    const { error: userSfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: user_id,
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
        user_id: user_id,
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
