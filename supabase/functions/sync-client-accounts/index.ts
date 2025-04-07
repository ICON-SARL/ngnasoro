
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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { sfdId, clientId } = await req.json();

    if (!sfdId) {
      return new Response(
        JSON.stringify({ error: "SFD ID is required" }),
        { headers: corsHeaders, status: 400 }
      );
    }

    let query = supabase.from('sfd_clients')
      .select('id, user_id')
      .eq('sfd_id', sfdId)
      .is('user_id', 'not.null');

    if (clientId) {
      query = query.eq('id', clientId);
    }

    const { data: clients, error: clientsError } = await query;

    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      return new Response(
        JSON.stringify({ error: clientsError.message }),
        { headers: corsHeaders, status: 500 }
      );
    }

    if (!clients || clients.length === 0) {
      return new Response(
        JSON.stringify({ message: "No clients found that need synchronization" }),
        { headers: corsHeaders, status: 200 }
      );
    }

    let syncCount = 0;
    for (const client of clients) {
      if (!client.user_id) continue;

      // Check if user already has an account
      const { data: existingAccount, error: accountError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();

      if (accountError) {
        console.error(`Error checking account for user ${client.user_id}:`, accountError);
        continue;
      }

      if (!existingAccount) {
        // Create new account
        const { error: createError } = await supabase
          .from('accounts')
          .insert({
            user_id: client.user_id,
            balance: 0,
            currency: 'FCFA',
            sfd_id: sfdId
          });

        if (createError) {
          console.error(`Error creating account for user ${client.user_id}:`, createError);
          continue;
        }
        
        syncCount++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Synchronized ${syncCount} accounts`,
        syncedCount: syncCount 
      }),
      { headers: corsHeaders, status: 200 }
    );

  } catch (error) {
    console.error("Error in sync-client-accounts function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: corsHeaders, status: 500 }
    );
  }
});
