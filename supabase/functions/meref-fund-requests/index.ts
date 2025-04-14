
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
    const { action, sfdId, requestId, fundRequest } = body;
    
    // Process based on requested action
    if (action === "createFundRequest" && sfdId && fundRequest) {
      console.log(`Creating new fund request for SFD: ${sfdId}`);
      
      const { data, error } = await supabase
        .from("subsidy_requests")
        .insert({
          sfd_id: sfdId,
          amount: fundRequest.amount,
          purpose: fundRequest.purpose,
          justification: fundRequest.justification,
          requested_by: fundRequest.userId,
          priority: fundRequest.priority || 'normal',
          region: fundRequest.region,
          expected_impact: fundRequest.expected_impact
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
      
      // Create an activity to track this creation
      await supabase
        .from("subsidy_request_activities")
        .insert({
          request_id: data.id,
          activity_type: "request_created",
          performed_by: fundRequest.userId,
          description: "Fund request created"
        });
      
      return new Response(
        JSON.stringify(data),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (action === "getFundRequests" && sfdId) {
      console.log(`Fetching fund requests for SFD: ${sfdId}`);
      
      const { data, error } = await supabase
        .from("subsidy_requests")
        .select("*")
        .eq("sfd_id", sfdId)
        .order("created_at", { ascending: false });
        
      if (error) {
        console.error("Error fetching fund requests:", error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      return new Response(
        JSON.stringify(data || []),
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
