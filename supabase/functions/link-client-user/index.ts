
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

    const { clientId, email } = await req.json();

    if (!clientId || !email) {
      return new Response(
        JSON.stringify({ error: "Client ID and email are required" }),
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

    // Find user by email
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, email')
      .ilike('email', email)
      .maybeSingle();

    if (profileError) {
      return new Response(
        JSON.stringify({ error: "Error searching user profiles", details: profileError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: `No user found with email ${email}` }),
        { headers: corsHeaders, status: 404 }
      );
    }

    // Link client to user
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('sfd_clients')
      .update({ user_id: userProfile.id })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to link client with user", details: updateError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Create savings account if it doesn't exist
    const { data: existingAccount } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userProfile.id)
      .maybeSingle();

    let accountData = existingAccount;

    if (!existingAccount) {
      const { data: newAccount, error: accountError } = await supabaseAdmin
        .from('accounts')
        .insert({
          user_id: userProfile.id,
          balance: 0,
          currency: 'FCFA',
          sfd_id: client.sfd_id
        })
        .select()
        .single();

      if (accountError) {
        console.error("Error creating savings account:", accountError);
        // We continue even if account creation fails
      } else {
        accountData = newAccount;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Client linked to existing user successfully",
        client: updatedClient,
        user: userProfile,
        account: accountData
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error("Error in link-client-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
