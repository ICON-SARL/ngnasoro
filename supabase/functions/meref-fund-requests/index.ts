
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
    
    // Extract request data
    const data = await req.json();
    const { action } = data;
    
    if (action === "list") {
      // Fetch all subsidy requests
      const sfdId = data.sfdId;
      let query = supabase.from("subsidy_requests").select(`
        id,
        sfd_id,
        amount,
        purpose,
        justification,
        expected_impact,
        region,
        status,
        priority,
        created_at,
        requested_by,
        reviewed_at,
        reviewed_by,
        decision_comments,
        alert_triggered,
        sfds:sfd_id (
          id,
          name,
          code
        )
      `);
      
      // Filter by SFD if provided
      if (sfdId) {
        query = query.eq("sfd_id", sfdId);
      }
      
      const { data: requests, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching fund requests:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(requests),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "create") {
      const params = data.fundRequest || data;
      // Create a new subsidy request
      const { data: newRequest, error } = await supabase
        .from("subsidy_requests")
        .insert({
          sfd_id: params.sfdId,
          amount: params.amount,
          purpose: params.purpose,
          justification: params.justification,
          expected_impact: params.expected_impact,
          region: params.region,
          priority: params.priority || "normal",
          requested_by: params.userId
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating fund request:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the creation activity
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: newRequest.id,
          activity_type: "request_created",
          performed_by: params.userId,
          description: "Demande de financement créée"
        });
      
      return new Response(
        JSON.stringify(newRequest),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if ((action === "approve" || action === "reject") && data.requestId) {
      // Load the current request to get details
      const { data: request, error: fetchError } = await supabase
        .from("subsidy_requests")
        .select("*")
        .eq("id", data.requestId)
        .single();
        
      if (fetchError) {
        console.error("Error fetching request:", fetchError);
        return new Response(
          JSON.stringify({ error: fetchError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Process the approval/rejection
      const { data: updatedRequest, error: updateError } = await supabase
        .from("subsidy_requests")
        .update({
          status: action === "approve" ? "approved" : "rejected",
          reviewed_by: data.adminId,
          reviewed_at: new Date().toISOString(),
          decision_comments: data.comments
        })
        .eq("id", data.requestId)
        .select()
        .single();
        
      if (updateError) {
        console.error(`Error ${action}ing request:`, updateError);
        return new Response(
          JSON.stringify({ error: updateError.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the activity
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: data.requestId,
          activity_type: action === "approve" ? "request_approved" : "request_rejected",
          performed_by: data.adminId,
          description: action === "approve" ? "Demande approuvée" : "Demande rejetée",
          details: {
            comments: data.comments,
            previous_status: request.status
          }
        });
      
      return new Response(
        JSON.stringify(updatedRequest),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "createFundRequest") {
      // Alternative endpoint for creating fund requests
      const { sfdId, fundRequest } = data;
      
      // Create a new subsidy request
      const { data: newRequest, error } = await supabase
        .from("subsidy_requests")
        .insert({
          sfd_id: sfdId,
          amount: fundRequest.amount,
          purpose: fundRequest.purpose,
          justification: fundRequest.justification,
          expected_impact: fundRequest.expected_impact || null,
          region: fundRequest.region || null,
          priority: fundRequest.priority || "normal",
          requested_by: fundRequest.userId
        })
        .select()
        .single();
        
      if (error) {
        console.error("Error creating fund request:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Log the creation activity
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: newRequest.id,
          activity_type: "request_created",
          performed_by: fundRequest.userId,
          description: "Demande de financement créée"
        });
      
      return new Response(
        JSON.stringify(newRequest),
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
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
