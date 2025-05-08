
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

    // Extract parameters from request body
    const { 
      userId, 
      sfdId, 
      forceFullSync = false 
    } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "User ID is required", success: false }),
        { headers: corsHeaders, status: 400 }
      );
    }

    console.log(`Synchronizing SFD accounts for user ${userId}${sfdId ? `, focusing on SFD ${sfdId}` : ""}${forceFullSync ? ", forcing full sync" : ""}`);

    // First, check if user is a client in any SFD
    const { data: clientAccounts, error: clientError } = await supabaseAdmin
      .from('sfd_clients')
      .select('sfd_id, sfds:sfd_id(id, name, code)')
      .eq('user_id', userId)
      .eq('status', 'validated');

    if (clientError) {
      console.error('Error fetching client SFDs:', clientError);
      // Continue with user_sfds as fallback
    } else if (clientAccounts && clientAccounts.length > 0) {
      console.log(`User is a validated client in ${clientAccounts.length} SFDs`);
      
      // Ensure user_sfds entries exist for client accounts
      for (const clientAccount of clientAccounts) {
        const { data: existingAssociation, error: assocError } = await supabaseAdmin
          .from('user_sfds')
          .select('id')
          .eq('user_id', userId)
          .eq('sfd_id', clientAccount.sfd_id)
          .maybeSingle();
          
        if (assocError) {
          console.error(`Error checking user_sfds for ${clientAccount.sfd_id}:`, assocError);
          continue;
        }
        
        if (!existingAssociation) {
          // Create association
          await supabaseAdmin
            .from('user_sfds')
            .insert({
              user_id: userId,
              sfd_id: clientAccount.sfd_id,
              is_default: true // Make first one default
            });
            
          console.log(`Created user_sfds association for ${clientAccount.sfd_id}`);
        }
      }
    }

    // Get all SFDs associated with the user (from user_sfds)
    const { data: userSfds, error: sfdError } = await supabaseAdmin
      .from('user_sfds')
      .select('sfd_id, sfds:sfd_id(id, name, code)')
      .eq('user_id', userId);

    if (sfdError) {
      console.error('Error fetching user SFDs:', sfdError);
      return new Response(
        JSON.stringify({ error: sfdError.message, success: false }),
        { headers: corsHeaders, status: 500 }
      );
    }

    console.log(`Found ${userSfds?.length || 0} SFDs from user_sfds table`);

    // Filter to specific SFD if requested
    const sfdsToProcess = sfdId 
      ? userSfds?.filter(s => s.sfd_id === sfdId)
      : userSfds;

    if (!sfdsToProcess?.length) {
      return new Response(
        JSON.stringify({ 
          message: "No SFDs to synchronize for this user", 
          success: true,
          syncedAccounts: [] 
        }),
        { headers: corsHeaders, status: 200 }
      );
    }

    console.log(`Processing ${sfdsToProcess?.length} SFD accounts for user ${userId}`);

    const syncedAccounts = [];

    // Process each SFD account
    for (const userSfd of sfdsToProcess) {
      const sfdData = userSfd.sfds as any;
      console.log(`Processing SFD account: ${sfdData.name} (${userSfd.sfd_id})`);
      
      // Check if user is a validated client in this SFD
      const { data: clientData, error: clientDataError } = await supabaseAdmin
        .from('sfd_clients')
        .select('id, status')
        .eq('user_id', userId)
        .eq('sfd_id', userSfd.sfd_id)
        .eq('status', 'validated')
        .maybeSingle();
        
      const isValidatedClient = clientData && clientData.status === 'validated';
      
      // Check if account already exists
      const { data: existingAccounts, error: accountError } = await supabaseAdmin
        .from('accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('sfd_id', userSfd.sfd_id);
      
      if (accountError) {
        console.error(`Error checking existing account: ${accountError.message}`);
        continue;
      }

      let currentBalance = 0;
      let accountId: string | null = null;

      if (existingAccounts && existingAccounts.length > 0) {
        // Use existing account and balance
        currentBalance = existingAccounts[0].balance || 0;
        accountId = existingAccounts[0].id;
        console.log(`Using existing balance for ${sfdData.name}: ${currentBalance}`);
      } else {
        // Generate a synthetic balance for demo purposes or new accounts
        // Only generate a random balance for valid client accounts
        currentBalance = (isValidatedClient && forceFullSync) ? Math.floor(Math.random() * 100000) + 50000 : 0;
        console.log(`Generated new balance for ${sfdData.name}: ${currentBalance}`);
      }

      // Update or create account
      if (accountId) {
        // Update existing account
        const { error: updateError } = await supabaseAdmin
          .from('accounts')
          .update({
            balance: isValidatedClient && forceFullSync ? currentBalance : existingAccounts[0].balance,
            last_updated: new Date().toISOString()
          })
          .eq('id', accountId);

        if (updateError) {
          console.error(`Error updating account: ${updateError.message}`);
          continue;
        }
      } else {
        // Create new account
        const { data: newAccount, error: createError } = await supabaseAdmin
          .from('accounts')
          .insert({
            user_id: userId,
            sfd_id: userSfd.sfd_id,
            balance: currentBalance,
            currency: 'FCFA',
            last_updated: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) {
          console.error(`Error creating account: ${createError.message}`);
          continue;
        }

        accountId = newAccount.id;
      }

      console.log(`Updated account for SFD ${sfdData.name}`);
      
      // Add to synced accounts list
      syncedAccounts.push({
        id: accountId,
        sfd_id: userSfd.sfd_id,
        sfd_name: sfdData.name,
        sfd_code: sfdData.code,
        balance: currentBalance,
        currency: 'FCFA',
        is_validated_client: isValidatedClient
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Successfully synchronized ${syncedAccounts.length} SFD accounts`,
        syncedAccounts
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error('Error in synchronize-sfd-accounts function:', error);
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
