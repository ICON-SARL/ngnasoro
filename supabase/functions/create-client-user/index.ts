
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function generateTemporaryPassword() {
  // Generate a random temporary password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Create Supabase client with service role (for admin-level access)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Get the client ID from the request
    const { clientId } = await req.json();

    if (!clientId) {
      return new Response(
        JSON.stringify({ error: "Client ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get the client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('*, sfds:sfd_id(*)')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Error finding client:', clientError);
      return new Response(
        JSON.stringify({ error: "Client not found", details: clientError }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // Check if client already has a user account
    if (client.user_id) {
      console.log('Client already has a user account:', client.user_id);
      
      // Check if savings account exists
      const { data: existingAccount } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();
      
      // If no savings account, create one
      let accountData = existingAccount;
      let accountCreated = false;
      
      if (!existingAccount) {
        const { data: newAccount, error: accountError } = await supabaseAdmin
          .from('accounts')
          .insert({
            user_id: client.user_id,
            balance: 0,
            currency: 'FCFA',
            sfd_id: client.sfd_id
          })
          .select()
          .single();
        
        if (!accountError) {
          accountData = newAccount;
          accountCreated = true;
        }
      }
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "User account already exists for this client",
          client: client,
          user_id: client.user_id,
          account: accountData,
          accountCreated
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // Generate temporary password for the user
    const tempPassword = generateTemporaryPassword();

    // Create new user in auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: client.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: client.full_name,
        sfd_id: client.sfd_id
      },
      app_metadata: {
        role: 'client'
      }
    });

    if (authError || !authData.user) {
      console.error('Error creating user:', authError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to create user account", 
          details: authError 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    const newUserId = authData.user.id;

    // Update the client with the new user_id
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('sfd_clients')
      .update({ user_id: newUserId })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating client:', updateError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to update client with user ID",
          details: updateError 
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Create or update profile record
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: newUserId,
        full_name: client.full_name,
        email: client.email,
        phone: client.phone,
      });

    if (profileError) {
      console.error('Error creating profile:', profileError);
      // Continue despite profile error
    }

    // Assign client role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({
        user_id: newUserId,
        role: 'client'
      });

    if (roleError) {
      console.error('Error assigning role:', roleError);
      // Continue despite role error
    }

    // Create user-sfd association
    const { error: sfdAssocError } = await supabaseAdmin
      .from('user_sfds')
      .insert({
        user_id: newUserId,
        sfd_id: client.sfd_id,
        is_default: true
      });

    if (sfdAssocError) {
      console.error('Error creating SFD association:', sfdAssocError);
      // Continue despite association error
    }

    // Create savings account for the user
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: newUserId,
        balance: 0,
        currency: 'FCFA',
        sfd_id: client.sfd_id
      })
      .select()
      .single();

    if (accountError) {
      console.error('Error creating savings account:', accountError);
      // Continue despite account error
    }

    // Log the user creation activity
    const { error: activityError } = await supabaseAdmin
      .from('client_activities')
      .insert({
        client_id: clientId,
        activity_type: 'account_created',
        description: 'User account created for client',
        performed_by: null
      });

    if (activityError) {
      console.error('Error logging activity:', activityError);
      // Continue despite activity error
    }

    // Store temporary credentials in a secure table for admin reference
    const { error: credentialsError } = await supabaseAdmin
      .from('temp_auth_credentials')
      .insert({
        client_id: clientId,
        temp_password: tempPassword
      });

    if (credentialsError) {
      console.error('Error storing temporary credentials:', credentialsError);
      // Continue despite credentials error
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User account created successfully",
        client: updatedClient,
        user_id: newUserId,
        account: account,
        temp_credentials: {
          email: client.email,
          password: tempPassword
        }
      }),
      { headers: corsHeaders, status: 201 }
    );
  } catch (error) {
    console.error("Error in create-client-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
