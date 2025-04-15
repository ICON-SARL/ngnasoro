
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
    
    // Get all approved subsidy requests that haven't been credited yet
    const { data: pendingRequests, error: requestsError } = await supabase
      .from("subsidy_requests")
      .select("*")
      .eq("status", "approved")
      .is("credited_at", null);
      
    if (requestsError) {
      console.error("Error fetching pending requests:", requestsError);
      throw requestsError;
    }
    
    console.log(`Found ${pendingRequests.length} pending subsidy requests to process`);
    
    // Process each pending request
    const results = [];
    for (const request of pendingRequests) {
      try {
        // 1. Update the SFD operation account balance
        const { data: sfdAccount, error: accountError } = await supabase
          .from("sfd_accounts")
          .select("*")
          .eq("sfd_id", request.sfd_id)
          .eq("account_type", "operation")
          .single();
          
        if (accountError) {
          console.error(`Error fetching SFD account for request ${request.id}:`, accountError);
          results.push({
            request_id: request.id,
            success: false,
            error: "SFD operation account not found"
          });
          continue;
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
          console.error(`Error updating SFD account for request ${request.id}:`, updateAccountError);
          results.push({
            request_id: request.id,
            success: false,
            error: updateAccountError.message
          });
          continue;
        }
        
        // 2. Update the request status to completed
        const { data: updatedRequest, error: updateRequestError } = await supabase
          .from("subsidy_requests")
          .update({
            status: "completed",
            credited_at: new Date().toISOString()
          })
          .eq("id", request.id)
          .select()
          .single();
          
        if (updateRequestError) {
          console.error(`Error updating request ${request.id}:`, updateRequestError);
          results.push({
            request_id: request.id,
            success: false,
            error: updateRequestError.message
          });
          continue;
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
            reference_id: request.id
          });
          
        if (transactionError) {
          console.error(`Error creating transaction for request ${request.id}:`, transactionError);
          // We don't fail the whole process if just the transaction creation fails
        }
        
        // 4. Log the transfer activity
        await supabase
          .from("subsidy_request_activities")
          .insert({
            request_id: request.id,
            activity_type: "funds_transferred",
            performed_by: request.requested_by,
            description: "Fonds transférés au compte de la SFD par le job quotidien",
            details: {
              amount: request.amount,
              sfd_account_id: sfdAccount.id,
              automatic: true
            }
          });
        
        results.push({
          request_id: request.id,
          success: true,
          amount: request.amount,
          sfd_id: request.sfd_id
        });
        
      } catch (requestError) {
        console.error(`Error processing request ${request.id}:`, requestError);
        results.push({
          request_id: request.id,
          success: false,
          error: requestError.message || "Unknown error"
        });
      }
    }
    
    // Create a log entry for this sync
    await supabase
      .from("audit_logs")
      .insert({
        action: "daily_meref_sync",
        category: "SYSTEM",
        severity: "INFO",
        status: "success",
        details: {
          processed_count: pendingRequests.length,
          success_count: results.filter(r => r.success).length,
          failure_count: results.filter(r => !r.success).length,
          results: results
        }
      });
    
    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingRequests.length,
        succeeded: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length,
        results: results
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Server error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
