
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Get environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return new Response(
        JSON.stringify({ error: "Server configuration missing" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Create Supabase client with service key (admin privileges)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Extract request parameters
    const body = await req.json();
    const { action, requestId } = body;
    
    console.log(`Processing MEREF funding action: ${action}, ID: ${requestId}`);
    
    if (action === "transfer" && requestId) {
      // Get the subsidy request
      const { data: request, error: fetchError } = await supabase
        .from("subsidy_requests")
        .select("*")
        .eq("id", requestId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching request:", fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Ensure the request is approved
      if (request.status !== "approved") {
        return new Response(
          JSON.stringify({ error: "Cannot transfer funds for a request that is not approved" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // 1. Update the SFD operation account balance
      const { data: sfdAccount, error: accountError } = await supabase
        .from("sfd_accounts")
        .select("*")
        .eq("sfd_id", request.sfd_id)
        .eq("account_type", "operation")
        .single();
        
      if (accountError) {
        console.error("Error fetching SFD account:", accountError);
        return new Response(
          JSON.stringify({ error: "SFD operation account not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Update the account balance
      const { error: updateAccountError } = await supabase
        .from("sfd_accounts")
        .update({
          balance: sfdAccount.balance + request.amount,
          updated_at: new Date().toISOString()
        })
        .eq("id", sfdAccount.id);
        
      if (updateAccountError) {
        console.error("Error updating SFD account:", updateAccountError);
        return new Response(
          JSON.stringify({ error: updateAccountError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // 2. Update the request status to completed
      const { data: updatedRequest, error: updateRequestError } = await supabase
        .from("subsidy_requests")
        .update({
          status: "completed",
          credited_at: new Date().toISOString()
        })
        .eq("id", requestId)
        .select()
        .single();
        
      if (updateRequestError) {
        console.error("Error updating request:", updateRequestError);
        return new Response(
          JSON.stringify({ error: updateRequestError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // 3. Create a transaction record
      const { error: transactionError } = await supabase
        .from("transactions")
        .insert({
          user_id: request.requested_by,
          sfd_id: request.sfd_id,
          type: "credit",
          amount: request.amount,
          name: "Financement MEREF",
          description: `Transfert de fonds MEREF: ${request.purpose}`,
          reference_id: requestId
        });
        
      if (transactionError) {
        console.error("Error creating transaction:", transactionError);
        // We don't return an error here because the funds have already been transferred
      }
      
      // 4. Log the transfer activity
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: requestId,
          activity_type: "funds_transferred",
          performed_by: request.requested_by,
          description: "Fonds transférés au compte de la SFD",
          details: {
            amount: request.amount,
            sfd_account_id: sfdAccount.id
          }
        });
      
      return new Response(
        JSON.stringify(updatedRequest),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Action not supported
    return new Response(
      JSON.stringify({ error: "Action not supported" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
