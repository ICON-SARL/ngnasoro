
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
    const { email, password, full_name, role } = await req.json();

    // Validate input
    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({
          error: "Tous les champs email, password, full_name, et role sont requis"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        }
      );
    }

    // Validate role
    if (!["admin", "sfd_admin", "user"].includes(role)) {
      return new Response(
        JSON.stringify({
          error: "Le rôle doit être 'admin', 'sfd_admin', ou 'user'"
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

    // Create the user
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
      },
      app_metadata: {
        role,
      },
    });

    if (userError) {
      console.error("Erreur lors de la création de l'utilisateur:", userError);
      throw userError;
    }

    // Add user to admin_users table
    const { error: adminUserError } = await supabaseAdmin
      .from("admin_users")
      .insert({
        id: userData.user.id,
        email,
        full_name,
        role,
      });

    if (adminUserError) {
      console.error("Erreur lors de la création de l'enregistrement admin_user:", adminUserError);
      throw adminUserError;
    }

    // Assign role through function
    const { error: roleError } = await supabaseAdmin.rpc("assign_role", {
      user_id: userData.user.id,
      role: role
    });

    if (roleError) {
      console.error("Erreur lors de l'attribution du rôle:", roleError);
      throw roleError;
    }

    // Return success
    return new Response(
      JSON.stringify({
        success: true,
        message: `Utilisateur ${role} créé avec succès`,
        userId: userData.user.id,
        userEmail: email
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Erreur du serveur:", error.message);
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
