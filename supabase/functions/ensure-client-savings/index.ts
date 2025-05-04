
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
    console.log("Starting ensure-client-savings function");
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { clientId, sfdId } = await req.json();
    console.log("Request params:", { clientId, sfdId });

    if (!clientId) {
      console.error("Client ID is required");
      return new Response(
        JSON.stringify({ error: "Client ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Get client details including user_id
    const { data: client, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error("Client not found:", clientError);
      return new Response(
        JSON.stringify({ error: "Client not found", details: clientError }),
        { headers: corsHeaders, status: 404 }
      );
    }

    console.log("Client found:", client);

    // If client doesn't have a user_id, create one
    let userId = client.user_id;
    
    if (!userId) {
      console.log("No user_id found, looking up or creating user");
      
      // Try to find an existing user by email
      if (client.email) {
        const { data: userProfile } = await supabaseAdmin
          .from('profiles')
          .select('id')
          .ilike('email', client.email)
          .maybeSingle();
          
        if (userProfile) {
          console.log("Found user by email:", userProfile.id);
          userId = userProfile.id;
          
          // Update client with found user_id
          await supabaseAdmin
            .from('sfd_clients')
            .update({ user_id: userId })
            .eq('id', clientId);
            
          console.log("Updated client with user_id");
        }
      }
      
      // If still no user_id, create a new user
      if (!userId) {
        console.log("Creating new user for client");
        const tempPassword = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12).toUpperCase();
        
        if (!client.email) {
          console.error("Client email is required to create user account");
          return new Response(
            JSON.stringify({ error: "Client email is required to create user account" }),
            { headers: corsHeaders, status: 400 }
          );
        }
        
        const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email: client.email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: client.full_name,
            phone: client.phone
          }
        });
        
        if (authError || !authUser.user) {
          console.error("Failed to create user account:", authError);
          return new Response(
            JSON.stringify({ error: "Failed to create user account", details: authError }),
            { headers: corsHeaders, status: 500 }
          );
        }
        
        userId = authUser.user.id;
        console.log("Created new user with ID:", userId);
        
        // Update client with new user_id
        await supabaseAdmin
          .from('sfd_clients')
          .update({ user_id: userId })
          .eq('id', clientId);
          
        console.log("Updated client with new user_id");
      }
    }
    
    if (!userId) {
      console.error("Unable to get or create user_id for client");
      return new Response(
        JSON.stringify({ error: "Cannot create savings account without a user account" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Use provided sfdId or the one from the client record
    const useSfdId = sfdId || client.sfd_id;

    if (!useSfdId) {
      console.error("SFD ID is required");
      return new Response(
        JSON.stringify({ error: "SFD ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if savings account already exists
    const { data: existingAccount, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (accountError) {
      console.error("Error checking existing accounts:", accountError);
      return new Response(
        JSON.stringify({ error: "Error checking existing accounts", details: accountError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // If account exists, return it
    if (existingAccount) {
      console.log("Savings account already exists:", existingAccount);
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Savings account already exists",
          account: existingAccount,
          accountExists: true
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    // Create new savings account
    console.log("Creating new savings account for user:", userId);
    const { data: newAccount, error: createError } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: userId,
        balance: 0,
        currency: 'FCFA',
        sfd_id: useSfdId
      })
      .select()
      .single();

    if (createError) {
      console.error("Failed to create savings account:", createError);
      return new Response(
        JSON.stringify({ error: "Failed to create savings account", details: createError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    console.log("Successfully created savings account:", newAccount);
    return new Response(
      JSON.stringify({
        success: true,
        message: "Savings account created successfully",
        account: newAccount,
        accountExists: false
      }),
      { headers: corsHeaders, status: 201 }
    );
  } catch (error) {
    console.error("Error in ensure-client-savings function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
