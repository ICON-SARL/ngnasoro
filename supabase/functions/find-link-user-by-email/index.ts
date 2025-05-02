
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

    // First check if the client record exists
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

    // Check if user with email exists
    const { data: user, error: userError } = await supabaseAdmin
      .auth.admin.listUsers({
        filters: {
          email: email
        }
      });

    if (userError) {
      return new Response(
        JSON.stringify({ error: "Error finding user", details: userError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Check if any users were found
    if (!user.users || user.users.length === 0) {
      return new Response(
        JSON.stringify({ error: `No users found with email ${email}` }),
        { headers: corsHeaders, status: 404 }
      );
    }

    const foundUser = user.users[0];
    
    // Link client to user
    const { data: updatedClient, error: updateError } = await supabaseAdmin
      .from('sfd_clients')
      .update({ user_id: foundUser.id })
      .eq('id', clientId)
      .select()
      .single();

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to update client", details: updateError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // Ensure savings account exists
    const { data: existingAccount } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', foundUser.id)
      .maybeSingle();

    let accountData = existingAccount;
    let accountCreated = false;

    if (!existingAccount) {
      const { data: newAccount, error: accountError } = await supabaseAdmin
        .from('accounts')
        .insert({
          user_id: foundUser.id,
          balance: 0,
          currency: 'FCFA',
          sfd_id: client.sfd_id
        })
        .select()
        .single();

      if (!accountError && newAccount) {
        accountData = newAccount;
        accountCreated = true;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User found and linked to client",
        client: updatedClient,
        user: {
          id: foundUser.id,
          email: foundUser.email
        },
        account: accountData,
        accountCreated
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (error) {
    console.error("Error in find-link-user-by-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
