
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
    const { action, requestId, data } = body;
    
    console.log(`Processing subsidy request action: ${action}, ID: ${requestId}`);
    
    if (action === "approve" && requestId) {
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
      
      // Update the request status
      const { data: updatedRequest, error: updateError } = await supabase
        .from("subsidy_requests")
        .update({
          status: "approved",
          reviewed_by: request.requested_by, // In a real scenario, this would be the current admin user
          reviewed_at: new Date().toISOString(),
          decision_comments: data?.comments || "Approved without comments"
        })
        .eq("id", requestId)
        .select()
        .single();
        
      if (updateError) {
        console.error("Error updating request:", updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the approval activity
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: requestId,
          activity_type: "request_approved",
          performed_by: request.requested_by, // In a real scenario, this would be the current admin user
          description: "Demande approuvée",
          details: {
            comments: data?.comments,
            previous_status: request.status
          }
        });
      
      return new Response(
        JSON.stringify(updatedRequest),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "reject" && requestId) {
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
      
      // Update the request status
      const { data: updatedRequest, error: updateError } = await supabase
        .from("subsidy_requests")
        .update({
          status: "rejected",
          reviewed_by: request.requested_by, // In a real scenario, this would be the current admin user
          reviewed_at: new Date().toISOString(),
          decision_comments: data?.comments || "Rejected without specific reason"
        })
        .eq("id", requestId)
        .select()
        .single();
        
      if (updateError) {
        console.error("Error updating request:", updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the rejection activity
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: requestId,
          activity_type: "request_rejected",
          performed_by: request.requested_by, // In a real scenario, this would be the current admin user
          description: "Demande rejetée",
          details: {
            comments: data?.comments,
            previous_status: request.status
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
