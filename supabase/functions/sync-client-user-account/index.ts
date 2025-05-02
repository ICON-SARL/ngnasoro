
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

    // Step 1: Get the client details
    const { data: client, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .single();

    if (clientError || !client) {
      console.error('Error finding client:', clientError);
      return new Response(
        JSON.stringify({ error: "Client not found", details: clientError }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // Step 2: Check if client already has user_id
    let userId = client.user_id;

    // Step 3: If no user_id and client has email, search for matching user
    if (!userId && client.email) {
      const { data: userProfile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .ilike('email', client.email)
        .maybeSingle();

      if (userProfile?.id) {
        userId = userProfile.id;
        
        // Update the client with the found user_id
        await supabaseAdmin
          .from('sfd_clients')
          .update({ user_id: userId })
          .eq('id', clientId);
        
        console.log(`Linked client ${clientId} with existing user ${userId}`);
      }
    }

    // Step 4: If we have a user_id now, check if they have a savings account
    if (userId) {
      // Check if account already exists
      const { data: existingAccount, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('id, balance, currency')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingAccount) {
        console.log(`Savings account already exists for user ${userId}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "User already has a savings account", 
            account: existingAccount,
            user_id: userId,
            client: client
          }),
          { headers: corsHeaders, status: 200 }
        );
      } else {
        // Create a new savings account
        const { data: newAccount, error: createError } = await supabaseAdmin
          .from('accounts')
          .insert({
            user_id: userId,
            balance: 0,
            currency: 'FCFA',
            sfd_id: client.sfd_id
          })
          .select()
          .single();

        if (createError) {
          console.error('Error creating savings account:', createError);
          return new Response(
            JSON.stringify({ error: "Failed to create savings account", details: createError }),
            { headers: corsHeaders, status: 500 }
          );
        }

        console.log(`Created savings account for user ${userId}`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Savings account created successfully", 
            account: newAccount,
            user_id: userId,
            client: client
          }),
          { headers: corsHeaders, status: 201 }
        );
      }
    } else {
      return new Response(
        JSON.stringify({ 
          error: "No user account found or linked for this client",
          client: client,
          suggestion: "Consider manually creating a user account or linking to an existing one"
        }),
        { headers: corsHeaders, status: 404 }
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
