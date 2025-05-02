
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

    const { clientId, sfdId } = await req.json();

    if (!clientId) {
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
      return new Response(
        JSON.stringify({ error: "Client not found", details: clientError }),
        { headers: corsHeaders, status: 404 }
      );
    }

    if (!client.user_id) {
      return new Response(
        JSON.stringify({ error: "Client doesn't have an associated user account" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Use provided sfdId or the one from the client record
    const useSfdId = sfdId || client.sfd_id;

    if (!useSfdId) {
      return new Response(
        JSON.stringify({ error: "SFD ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // Check if savings account already exists
    const { data: existingAccount, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', client.user_id)
      .maybeSingle();

    if (accountError) {
      return new Response(
        JSON.stringify({ error: "Error checking existing accounts", details: accountError }),
        { headers: corsHeaders, status: 500 }
      );
    }

    // If account exists, return it
    if (existingAccount) {
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
    const { data: newAccount, error: createError } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: client.user_id,
        balance: 0,
        currency: 'FCFA',
        sfd_id: useSfdId
      })
      .select()
      .single();

    if (createError) {
      return new Response(
        JSON.stringify({ error: "Failed to create savings account", details: createError }),
        { headers: corsHeaders, status: 500 }
      );
    }

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
