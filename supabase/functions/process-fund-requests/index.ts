
import { serve } from "https://deno.land/std@0.188.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    console.log("Fonction process-fund-requests appelée");
    
    // Check environment variables
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing environment variables: SUPABASE_URL or SUPABASE_ANON_KEY");
      return new Response(
        JSON.stringify({ error: "Server configuration error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const supabaseClient = createClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );
    
    // Parse request body
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error("JSON parsing error:", parseError.message);
      return new Response(
        JSON.stringify({ error: "Invalid JSON format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const { action, requestId, data } = requestBody;
    console.log("Requested action:", action, "Request ID:", requestId);
    
    // Check authentication
    const { data: authData, error: authError } = await supabaseClient.auth.getUser();
    
    if (authError) {
      console.error("Authentication error:", authError.message);
      return new Response(
        JSON.stringify({ error: "Authentication error", details: authError.message }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const user = authData?.user;
    
    if (!user) {
      console.error("Unauthenticated user");
      return new Response(
        JSON.stringify({ error: "Unauthorized: unauthenticated user" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.log("Authenticated user:", user.id);
    
    let result;
    
    switch (action) {
      case "approve":
        console.log("Approving request:", requestId);
        // Approve the fund request
        const { data: approveData, error: approveError } = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "approved",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            decision_comments: data?.comments || ""
          })
          .eq("id", requestId)
          .select();
          
        if (approveError) {
          console.error("Error approving request:", approveError);
          throw approveError;
        }
        
        // Create an activity entry
        const { error: activityError } = await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "request_approved",
          performed_by: user.id,
          description: "Demande de subvention approuvée",
          details: data?.comments ? { comments: data.comments } : null
        });
        
        if (activityError) {
          console.warn("Error creating activity:", activityError);
          // Continue despite activity error
        }
        
        result = approveData;
        break;
        
      case "reject":
        console.log("Rejecting request:", requestId);
        // Reject the fund request
        const { data: rejectData, error: rejectError } = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "rejected",
            reviewed_at: new Date().toISOString(),
            reviewed_by: user.id,
            decision_comments: data?.comments || ""
          })
          .eq("id", requestId)
          .select();
          
        if (rejectError) {
          console.error("Error rejecting request:", rejectError);
          throw rejectError;
        }
        
        // Create an activity entry
        const { error: rejectActivityError } = await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "request_rejected",
          performed_by: user.id,
          description: "Demande de subvention rejetée",
          details: data?.comments ? { comments: data.comments } : null
        });
        
        if (rejectActivityError) {
          console.warn("Error creating reject activity:", rejectActivityError);
          // Continue despite activity error
        }
        
        result = rejectData;
        break;

      case "execute":
        console.log("Executing transfer for request:", requestId);
        // Execute the fund transfer
        const { data: executeData, error: executeError } = await supabaseClient
          .from("subsidy_requests")
          .update({
            status: "completed",
            credited_at: new Date().toISOString()
          })
          .eq("id", requestId)
          .select();
          
        if (executeError) {
          console.error("Error executing transfer:", executeError);
          throw executeError;
        }
        
        // Create an activity entry for the transfer execution
        const { error: executeActivityError } = await supabaseClient.from("subsidy_request_activities").insert({
          request_id: requestId,
          activity_type: "funds_transferred",
          performed_by: user.id,
          description: "Transfert de fonds effectué",
        });
        
        if (executeActivityError) {
          console.warn("Error creating execute activity:", executeActivityError);
          // Continue despite activity error
        }
        
        // Create a subsidy entry
        const { data: requestData } = await supabaseClient
          .from("subsidy_requests")
          .select("sfd_id, amount, purpose")
          .eq("id", requestId)
          .single();
          
        if (requestData) {
          const { error: subsidyError } = await supabaseClient
            .from("sfd_subsidies")
            .insert({
              sfd_id: requestData.sfd_id,
              amount: requestData.amount,
              remaining_amount: requestData.amount,
              allocated_by: user.id,
              status: "active",
              description: requestData.purpose
            });
            
          if (subsidyError) {
            console.error("Error creating subsidy:", subsidyError);
            // Continue despite subsidy error, but log it
          }
        }
        
        result = executeData;
        break;
        
      case "details":
        console.log("Fetching details for:", requestId);
        // Get complete request details
        const { data: requestDetails, error: requestError } = await supabaseClient
          .from("subsidy_requests")
          .select(`
            *,
            sfds:sfd_id(id, name, region, code),
            requester:requested_by(id, email),
            reviewer:reviewed_by(id, email)
          `)
          .eq("id", requestId)
          .single();
          
        if (requestError) {
          console.error("Error fetching request details:", requestError);
          throw requestError;
        }
        
        // Get activities history
        const { data: activities, error: activitiesError } = await supabaseClient
          .from("subsidy_request_activities")
          .select("*")
          .eq("request_id", requestId)
          .order("performed_at", { ascending: false });
          
        if (activitiesError) {
          console.error("Error fetching activities:", activitiesError);
          throw activitiesError;
        }
        
        result = {
          request: requestDetails,
          activities: activities,
        };
        
        break;
        
      default:
        console.error("Unrecognized action:", action);
        return new Response(
          JSON.stringify({ error: "Unrecognized action" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
    
    console.log("Operation successful");
    return new Response(
      JSON.stringify({ success: true, data: result }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Unhandled error:", error.message, error.stack);
    return new Response(
      JSON.stringify({ 
        error: error.message, 
        details: error.stack,
        timestamp: new Date().toISOString()
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
