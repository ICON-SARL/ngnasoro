
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  // Get Supabase client
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(
      JSON.stringify({ error: "No authorization header" }),
      {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }

  // Create Supabase client with the auth header from the request
  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  // Handle request
  try {
    const { action, payload } = await req.json();
    
    switch (action) {
      case "create_application": {
        const { sfdId, amount, purpose } = payload;
        
        // Validate inputs
        if (!sfdId || !amount || !purpose) {
          return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Get user info to verify SFD association
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !userData.user) {
          return new Response(
            JSON.stringify({ error: "User authentication failed" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Verify user is associated with SFD
        const { data: sfdData, error: sfdError } = await supabaseClient
          .from("user_sfds")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("sfd_id", sfdId)
          .single();
          
        if (sfdError || !sfdData) {
          return new Response(
            JSON.stringify({ error: "User not associated with this SFD" }),
            {
              status: 403,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Generate reference
        const date = new Date();
        const year = date.getFullYear();
        
        // Get count of existing applications for this year to generate sequence number
        const { count, error: countError } = await supabaseClient
          .from("credit_applications")
          .select("*", { count: "exact", head: true })
          .like("reference", `CREDIT-${year}-%`);
          
        if (countError) {
          return new Response(
            JSON.stringify({ error: "Could not generate reference" }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        const sequence = String(count ? count + 1 : 1).padStart(3, "0");
        const reference = `CREDIT-${year}-${sequence}`;
        
        // Calculate score (simplified example)
        const score = Math.floor(Math.random() * 40) + 60; // Random score between 60-99
        
        // Insert new application
        const { data, error } = await supabaseClient
          .from("credit_applications")
          .insert({
            reference,
            sfd_id: sfdId,
            amount,
            purpose,
            status: "pending",
            score
          })
          .select()
          .single();
          
        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to create application", details: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Log creation in audit logs
        await supabaseClient.from("audit_logs").insert({
          user_id: userData.user.id,
          action: "create_credit_application",
          category: "credit_management",
          status: "success",
          target_resource: `credit_applications/${data.id}`,
          details: {
            reference,
            amount,
            purpose
          },
          severity: "info"
        });
        
        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      case "get_applications": {
        const { sfdId, filters } = payload;
        
        // Check if admin or sfd_admin
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        let query = supabaseClient
          .from("credit_applications")
          .select(`
            id,
            reference,
            sfd_id,
            sfds:sfd_id (name),
            amount,
            purpose,
            status,
            score,
            created_at,
            approval_comments,
            rejection_reason,
            rejection_comments
          `);
        
        // Apply filters
        if (sfdId) {
          query = query.eq("sfd_id", sfdId);
        }
        
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        
        // Get results
        const { data, error } = await query.order("created_at", { ascending: false });
        
        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to fetch applications", details: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Format response
        const formattedData = data.map(item => ({
          id: item.id,
          reference: item.reference,
          sfd_id: item.sfd_id,
          sfd_name: item.sfds?.name || "SFD inconnu",
          amount: item.amount,
          purpose: item.purpose,
          status: item.status,
          created_at: item.created_at,
          score: item.score,
          approval_comments: item.approval_comments,
          rejection_reason: item.rejection_reason,
          rejection_comments: item.rejection_comments
        }));
        
        return new Response(
          JSON.stringify({ success: true, data: formattedData }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      case "approve_application": {
        const { applicationId, comments } = payload;
        
        if (!applicationId) {
          return new Response(
            JSON.stringify({ error: "Application ID is required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Get user info
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !userData.user) {
          return new Response(
            JSON.stringify({ error: "User authentication failed" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Update application status
        const { data, error } = await supabaseClient
          .from("credit_applications")
          .update({
            status: "approved",
            approval_comments: comments,
            approved_at: new Date().toISOString(),
            approved_by: userData.user.id
          })
          .eq("id", applicationId)
          .select()
          .single();
          
        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to approve application", details: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      case "reject_application": {
        const { applicationId, reason, comments } = payload;
        
        if (!applicationId || !reason) {
          return new Response(
            JSON.stringify({ error: "Application ID and reason are required" }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Get user info
        const { data: userData, error: userError } = await supabaseClient.auth.getUser();
        if (userError || !userData.user) {
          return new Response(
            JSON.stringify({ error: "User authentication failed" }),
            {
              status: 401,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        // Update application status
        const { data, error } = await supabaseClient
          .from("credit_applications")
          .update({
            status: "rejected",
            rejection_reason: reason,
            rejection_comments: comments,
            rejected_at: new Date().toISOString(),
            rejected_by: userData.user.id
          })
          .eq("id", applicationId)
          .select()
          .single();
          
        if (error) {
          return new Response(
            JSON.stringify({ error: "Failed to reject application", details: error.message }),
            {
              status: 500,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }
        
        return new Response(
          JSON.stringify({ success: true, data }),
          {
            status: 200,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
      
      default:
        return new Response(
          JSON.stringify({ error: "Invalid action" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
