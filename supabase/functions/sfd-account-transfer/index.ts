
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    const { sfdId, fromAccountId, toAccountId, amount, description } = await req.json();
    
    // Validate input
    if (!sfdId || !fromAccountId || !toAccountId || !amount || amount <= 0) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Missing or invalid parameters"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Don't allow transfer between same account
    if (fromAccountId === toAccountId) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Cannot transfer to the same account"
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400
        }
      );
    }
    
    // Start a transaction
    const { data, error } = await supabase.rpc("transfer_between_sfd_accounts", {
      p_from_account_id: fromAccountId,
      p_to_account_id: toAccountId,
      p_amount: amount,
      p_description: description
    });
    
    if (error) {
      console.error("Error during transfer:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 500
        }
      );
    }
    
    // Record the account transfer
    const { data: transferData, error: transferError } = await supabase
      .from('sfd_account_transfers')
      .insert({
        sfd_id: sfdId,
        from_account_id: fromAccountId,
        to_account_id: toAccountId,
        amount,
        description: description || "Transfer between SFD accounts"
      })
      .select()
      .single();
    
    if (transferError) {
      console.error("Error recording transfer:", transferError);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Transfer completed successfully",
        transfer: transferData
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500
      }
    );
  }
});
