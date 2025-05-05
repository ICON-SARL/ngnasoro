
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

    if (!clientId || !sfdId) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Client ID and SFD ID are required",
        }),
        { headers: corsHeaders, status: 400 }
      );
    }

    // 1. Get the client details to find user_id
    const { data: client, error: clientError } = await supabaseAdmin
      .from("sfd_clients")
      .select("*")
      .eq("id", clientId)
      .single();

    if (clientError || !client) {
      console.error("Error fetching client:", clientError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Client not found",
        }),
        { headers: corsHeaders, status: 404 }
      );
    }

    console.log("Client found:", client);

    // 2. Check if the client already has a user account
    if (!client.user_id) {
      console.log("Client does not have a user_id, attempting to create a user account");
      
      // Let's try to find a matching user by email first
      let userId = null;
      if (client.email) {
        const { data: existingUser } = await supabaseAdmin
          .from("profiles")
          .select("id")
          .eq("email", client.email)
          .single();

        if (existingUser) {
          userId = existingUser.id;
          console.log("Found existing user with matching email:", userId);
        }
      }

      // If no user found by email, create a new one
      if (!userId) {
        // Call function to create or link user account
        const { data: userData, error: userError } = await supabaseAdmin
          .auth.admin.createUser({
            email: client.email || `client-${clientId}@example.com`,
            email_confirm: true,
            user_metadata: {
              full_name: client.full_name,
              phone: client.phone,
              client_id: client.id
            },
            app_metadata: {
              role: "client"
            }
          });

        if (userError) {
          console.error("Error creating user account:", userError);
          return new Response(
            JSON.stringify({
              success: false,
              error: "Failed to create user account",
            }),
            { headers: corsHeaders, status: 500 }
          );
        }

        userId = userData.user.id;
      }

      // Link the user_id to the client record
      const { error: updateError } = await supabaseAdmin
        .from("sfd_clients")
        .update({ user_id: userId })
        .eq("id", clientId);

      if (updateError) {
        console.error("Error linking user to client:", updateError);
        return new Response(
          JSON.stringify({
            success: false,
            error: "Failed to link user to client",
          }),
          { headers: corsHeaders, status: 500 }
        );
      }

      // Add user-sfds association
      await supabaseAdmin
        .from("user_sfds")
        .upsert({
          user_id: userId,
          sfd_id: sfdId,
          is_default: true
        })
        .select();

      client.user_id = userId;
      console.log("Updated client with user_id:", userId);
    } else {
      // Ensure user has the SFD association
      const { data: existingAssoc } = await supabaseAdmin
        .from("user_sfds")
        .select("*")
        .eq("user_id", client.user_id)
        .eq("sfd_id", sfdId);

      if (!existingAssoc || existingAssoc.length === 0) {
        // Create the association
        await supabaseAdmin
          .from("user_sfds")
          .insert({
            user_id: client.user_id,
            sfd_id: sfdId,
            is_default: true
          });
        
        console.log("Created new user-SFD association for user:", client.user_id);
      }
    }

    // 3. Check if savings account already exists
    try {
      // Get ALL accounts for this user
      const { data: existingAccounts, error: accountsError } = await supabaseAdmin
        .from("accounts")
        .select("*")
        .eq("user_id", client.user_id);

      if (accountsError) {
        throw accountsError;
      }

      // If any account exists, we'll return the first one
      // Or preferably one that matches the current SFD
      if (existingAccounts && existingAccounts.length > 0) {
        // Check if any account matches the current SFD
        let matchingAccount = existingAccounts.find(acc => acc.sfd_id === sfdId);
        
        // If no matching account, use the first one and update it
        if (!matchingAccount) {
          matchingAccount = existingAccounts[0];
          
          // Update the account to link it to the current SFD
          const { error: updateError } = await supabaseAdmin
            .from("accounts")
            .update({ sfd_id: sfdId })
            .eq("id", matchingAccount.id);
            
          if (updateError) {
            console.error("Error updating account SFD:", updateError);
          } else {
            matchingAccount.sfd_id = sfdId;
            console.log("Updated existing account with new SFD ID:", matchingAccount);
          }
        }
        
        return new Response(
          JSON.stringify({
            success: true,
            accountExists: true,
            account: matchingAccount,
          }),
          { headers: corsHeaders, status: 200 }
        );
      }
    } catch (error) {
      console.error("Error checking existing accounts:", error);
      // Continue with account creation as it might just be a query error
    }

    // 4. Create savings account
    const { data: account, error: createError } = await supabaseAdmin
      .from("accounts")
      .insert({
        user_id: client.user_id,
        balance: 0,
        currency: "FCFA",
        sfd_id: sfdId,
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating savings account:", createError);
      return new Response(
        JSON.stringify({
          success: false,
          error: "Failed to create savings account",
        }),
        { headers: corsHeaders, status: 500 }
      );
    }

    console.log("Created savings account:", account);
    
    // 5. Create audit log
    await supabaseAdmin
      .from("audit_logs")
      .insert({
        action: "create_savings_account",
        category: "ACCOUNT_MANAGEMENT",
        status: "success",
        severity: "info",
        target_resource: `accounts/${account.id}`,
        details: {
          account_id: account.id,
          user_id: client.user_id,
          client_id: clientId,
          sfd_id: sfdId,
        },
      });

    return new Response(
      JSON.stringify({
        success: true,
        accountExists: false,
        account,
      }),
      { headers: corsHeaders, status: 200 }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err.message,
      }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
