
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
    
    console.log("Creating admin user with role:", role, "for SFD:", sfd_id);

    if (!email || !password || !full_name || !role) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Tous les champs requis doivent être fournis (email, password, full_name, role)" 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Create a new user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name,
        role,
        sfd_id
      }
    });

    if (authError) {
      console.error("Error creating user:", authError);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erreur lors de la création de l'utilisateur: ${authError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Aucun utilisateur créé" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("User created:", authData.user.id);

    // 2. Insert the user into the admin_users table
    const { error: adminError } = await supabase
      .from('admin_users')
      .insert({
        id: authData.user.id,
        email,
        full_name,
        role: 'sfd_admin'
      });

    if (adminError) {
      console.error("Error creating admin user record:", adminError);
      
      // Try to delete the auth user if admin_users record fails
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (cleanupError) {
        console.error("Error cleaning up auth user:", cleanupError);
      }
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Erreur lors de la création de l'enregistrement administrateur: ${adminError.message}` 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Assign the role to the user
    const { error: roleError } = await supabase.rpc(
      'assign_role',
      {
        user_id: authData.user.id,
        role: 'sfd_admin'
      }
    );

    if (roleError) {
      console.error("Error assigning role:", roleError);
      // Non-fatal, continue
    }

    // 4. Associate the user with the SFD
    const { error: sfdError } = await supabase
      .from('user_sfds')
      .insert({
        user_id: authData.user.id,
        sfd_id,
        is_default: true
      });

    if (sfdError) {
      console.warn("Error associating user with SFD:", sfdError);
      // Non-fatal, continue
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        user_id: authData.user.id,
        email,
        full_name,
        sfd_id
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Une erreur inattendue s'est produite: ${error.message}` 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
