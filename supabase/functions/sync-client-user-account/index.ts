
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { clientId } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Client ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      return new Response(
        JSON.stringify({ error: "Client not found", details: clientError }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // If client doesn't have a user_id, check if a user with the same email exists
    if (!client.user_id && client.email) {
      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', client.email)
        .maybeSingle();

      if (profileError) {
        console.error("Error looking up user profile:", profileError);
      }

      // If a user with this email exists, link them
      if (userProfile) {
        const { error: updateError } = await supabaseAdmin
          .from('sfd_clients')
          .update({ user_id: userProfile.id })
          .eq('id', clientId);

        if (updateError) {
          console.error("Error linking existing user:", updateError);
        } else {
          client.user_id = userProfile.id;
          console.log(`Linked client to existing user with id: ${userProfile.id}`);
        }
      }
    }

    // If client still doesn't have a user_id, create a new user
    if (!client.user_id) {
      // Generate a temporary password and create a user account
      const tempPassword = (Math.random().toString(36).substring(2, 10) + 
                           Math.random().toString(36).substring(2, 10)).toUpperCase();
      
      const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: client.email,
        password: tempPassword,
        email_confirm: true, // Auto-confirm the email
        user_metadata: {
          full_name: client.full_name,
          phone: client.phone
        }
      });

      if (authError || !authUser.user) {
        return new Response(
          JSON.stringify({ error: "Failed to create user account", details: authError }),
          { headers: corsHeaders, status: 500 }
        );
      }

      // Link the new user to the client
      const { error: updateError } = await supabaseAdmin
        .from('sfd_clients')
        .update({ user_id: authUser.user.id })
        .eq('id', clientId);

      if (updateError) {
        console.error("Error linking new user to client:", updateError);
        return new Response(
          JSON.stringify({ error: "Failed to link user account", details: updateError }),
          { headers: corsHeaders, status: 500 }
        );
      }

      client.user_id = authUser.user.id;
      console.log(`Created new user with id: ${authUser.user.id}`);

      // Store the temporary password so we can send it to the client
      try {
        await supabaseAdmin
          .from('temp_auth_credentials')
          .insert({
            client_id: clientId,
            temp_password: tempPassword,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
          });
      } catch (e) {
        console.error("Error storing temporary credentials:", e);
      }
    }

    // At this point, client.user_id should be defined
    if (!client.user_id) {
      return new Response(
        JSON.stringify({ error: "Failed to associate user with client" }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Check if savings account already exists
    const { data: existingAccount, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', client.user_id)
      .maybeSingle();

    if (accountError) {
      console.error("Error checking for existing account:", accountError);
    }

    // Create savings account if it doesn't exist
    if (!existingAccount) {
      const { data: newAccount, error: createError } = await supabaseAdmin
        .from('accounts')
        .insert({
          user_id: client.user_id,
          balance: 0,
          currency: 'FCFA',
          sfd_id: client.sfd_id
        })
        .select()
        .single();

      if (createError) {
        console.error("Error creating savings account:", createError);
        return new Response(
          JSON.stringify({ error: "Failed to create savings account", details: createError }),
          { headers: corsHeaders, status: 500 }
        );
      }

      console.log(`Created new savings account for user: ${client.user_id}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "User account and savings account created successfully",
          user_id: client.user_id,
          account: newAccount
        }),
        { headers: corsHeaders, status: 201 }
      );
    } else {
      console.log(`Savings account already exists for user: ${client.user_id}`);
      
      return new Response(
        JSON.stringify({
          success: true,
          message: "Client already has a savings account",
          user_id: client.user_id,
          account: existingAccount
        }),
        { headers: corsHeaders, status: 200 }
      );
    }
  } catch (error) {
    console.error("Error in sync-client-user-account function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
