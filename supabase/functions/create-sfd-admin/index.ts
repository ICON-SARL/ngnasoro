
import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get request body
    const { email, password, full_name, sfdId } = await req.json();

    // Validate input
    if (!email || !password || !full_name || !sfdId) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Create Supabase admin client with service role key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Step 1: Create the user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
      app_metadata: {
        role: "sfd_admin",
      },
    });

    if (userError) {
      console.error("Error creating user:", userError);
      throw userError;
    }

    // Step 2: Add user to admin_users table
    const { error: adminUserError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        id: userData.user.id,
        email,
        full_name,
        role: "sfd_admin",
      });

    if (adminUserError) {
      console.error("Error creating admin user record:", adminUserError);
      throw adminUserError;
    }

    // Step 3: Assign the user to the SFD
    const { error: sfdAssignError } = await supabaseAdmin
      .from("user_sfds")
      .insert({
        user_id: userData.user.id,
        sfd_id: sfdId,
        is_default: true,
      });

    if (sfdAssignError) {
      console.error("Error assigning SFD to user:", sfdAssignError);
      throw sfdAssignError;
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: "SFD admin created successfully",
        userId: userData.user.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Server error:", error.message);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
