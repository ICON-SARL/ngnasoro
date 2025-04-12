
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

    // Create a Supabase client with the service key to access Admin APIs
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Extract data from request
    let requestData;
    try {
      requestData = await req.json();
    } catch (error) {
      console.error("Error parsing request:", error);
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    const { sfdData, adminData } = requestData;
    
    console.log("Received SFD creation request:", { 
      sfdData, 
      hasAdminData: !!adminData 
    });
    
    // Validate SFD data
    if (!sfdData || !sfdData.name || !sfdData.code) {
      console.error("Missing SFD data:", sfdData);
      return new Response(
        JSON.stringify({ error: "Incomplete SFD data. Name and code are required." }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    try {
      // 1. Create the SFD record
      const { data: sfd, error: sfdError } = await supabase
        .from('sfds')
        .insert({
          name: sfdData.name,
          code: sfdData.code,
          region: sfdData.region || null,
          status: sfdData.status || 'active',
          contact_email: sfdData.contact_email || null,
          phone: sfdData.phone || null,
          address: sfdData.address || null,
          logo_url: sfdData.logo_url || null,
          legal_document_url: sfdData.legal_document_url || null,
          description: sfdData.description || null
        })
        .select()
        .single();

      if (sfdError) {
        console.error("Error creating SFD:", sfdError);
        return new Response(
          JSON.stringify({ error: `Error creating SFD: ${sfdError.message}` }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log("SFD created successfully:", sfd);

      let admin = null;
      
      // If admin data is provided, create the admin
      if (adminData && adminData.email && adminData.password && adminData.full_name) {
        console.log("Creating SFD admin...");
        
        try {
          // 2. Create the admin user in auth.users
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: adminData.email,
            password: adminData.password,
            email_confirm: true,
            user_metadata: {
              full_name: adminData.full_name,
              sfd_id: sfd.id
            },
            app_metadata: {
              role: 'sfd_admin'
            }
          });

          if (authError) {
            console.error("Error creating auth user:", authError);
            // Even if we fail to create the admin, return the SFD
            return new Response(
              JSON.stringify({ 
                sfd, 
                error: `Failed to create admin: ${authError.message}` 
              }),
              { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          if (!authData.user) {
            console.error("No user created");
            return new Response(
              JSON.stringify({ 
                sfd, 
                error: "No user created" 
              }),
              { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          const userId = authData.user.id;
          console.log("Admin auth user created with ID:", userId);

          // 3. Create admin_users record
          const { error: adminError } = await supabase
            .from('admin_users')
            .insert({
              id: userId,
              email: adminData.email,
              full_name: adminData.full_name,
              role: 'sfd_admin',
              has_2fa: false
            });

          if (adminError) {
            console.error("Error creating admin_user:", adminError);
            return new Response(
              JSON.stringify({ 
                sfd, 
                error: `Failed to create admin record: ${adminError.message}` 
              }),
              { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log("Admin record created in admin_users");

          // 4. Assign the sfd_admin role
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
              JSON.stringify({ 
                sfd, 
                error: `Failed to assign role: ${roleError.message}` 
              }),
              { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log("SFD admin role assigned");

          // 5. Create the connection between the admin and the SFD
          const { error: linkError } = await supabase
            .from('user_sfds')
            .insert({
              user_id: userId,
              sfd_id: sfd.id,
              is_default: true
            });

          if (linkError) {
            console.error("Error linking SFD to admin:", linkError);
            return new Response(
              JSON.stringify({ 
                sfd, 
                error: `Failed to link SFD to admin: ${linkError.message}` 
              }),
              { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
          }

          console.log("Admin linked to SFD");
          
          admin = {
            id: userId,
            email: adminData.email,
            full_name: adminData.full_name
          };
        } catch (adminError) {
          console.error("Error in admin creation process:", adminError);
          // Return SFD data even if admin creation fails
          return new Response(
            JSON.stringify({ 
              sfd, 
              error: `Admin creation failed: ${adminError.message}` 
            }),
            { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
      }

      // Return success with SFD and admin info
      return new Response(
        JSON.stringify({ sfd, admin }),
        { status: 201, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error: any) {
      console.error("Unhandled error in SFD creation:", error);
      return new Response(
        JSON.stringify({ error: `Unexpected error: ${error.message}` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
  } catch (error: any) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: `Server error: ${error.message}` }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
