
import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

// Initialize the Supabase client
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseKey);

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

// Define role-based permission mappings
const endpointPermissions = {
  "/subsidies": ["admin"],
  "/subsidy-requests": ["admin"],
  "/loans": ["admin", "sfd_admin"],
  "/apply-loan": ["admin", "sfd_admin", "user"],
  "/audit-logs": ["admin"],
  "/sfds": ["admin", "sfd_admin", "user"],
};

// Check if a user has permission to access an endpoint
function hasPermission(userRole: string, endpoint: string): boolean {
  // Find the matching endpoint pattern
  const matchingEndpoint = Object.keys(endpointPermissions).find(pattern => 
    endpoint.startsWith(pattern)
  );
  
  if (!matchingEndpoint) return false;
  
  // Check if the user's role has permission for this endpoint
  return endpointPermissions[matchingEndpoint as keyof typeof endpointPermissions].includes(userRole);
}

// Main handler
serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }

  try {
    // Get request body
    const requestData = await req.json();
    const { endpoint, method = "GET", data, requireAdmin = false } = requestData;
    
    // Extract user information from auth (in a real implementation)
    const authHeader = req.headers.get("Authorization") || "";
    
    // In a complete implementation, you'd verify the JWT token to get the user role
    // Here we're just checking if requestData has a role specified for demo purposes
    const userRole = requestData.userRole || "user";
    
    // Check role-based permission
    if (!hasPermission(userRole, endpoint)) {
      return new Response(
        JSON.stringify({
          error: "Insufficient permissions to access this endpoint",
          endpoint,
          userRole,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }
    
    // Special check for admin-only endpoints
    if (requireAdmin && userRole !== "admin") {
      return new Response(
        JSON.stringify({
          error: "This endpoint requires Super Admin privileges",
          endpoint,
          userRole,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 403,
        }
      );
    }
    
    // Process the request based on the endpoint
    // This is a mock implementation - in a real app, you would have actual processing logic
    let responseData;
    
    switch (endpoint) {
      case "/subsidies":
        // Only admins can access subsidies (enforced by permission check above)
        responseData = {
          success: true,
          data: [
            { id: "1", name: "Rural Subsidy Program", amount: 50000000 },
            { id: "2", name: "Urban Development Fund", amount: 75000000 },
          ],
          count: 2,
          pagination: {
            page: 1,
            pageSize: 10,
            totalPages: 1,
            totalCount: 2,
          },
        };
        break;
        
      case "/loans":
        // Admins and SFD admins can access loans
        responseData = {
          success: true,
          data: [
            { id: "1", client: "Client A", amount: 500000, status: "approved" },
            { id: "2", client: "Client B", amount: 750000, status: "pending" },
          ],
          count: 2,
          pagination: {
            page: 1,
            pageSize: 10,
            totalPages: 1,
            totalCount: 2,
          },
        };
        break;
        
      case "/apply-loan":
        // All authenticated users can apply for loans
        if (method === "POST" && data) {
          responseData = {
            success: true,
            message: "Loan application submitted successfully",
            applicationId: "app-" + Math.floor(Math.random() * 1000),
          };
        } else {
          responseData = {
            success: false,
            error: "Invalid request for loan application",
          };
        }
        break;
        
      case "/audit-logs":
        // Only admins can access audit logs
        responseData = {
          success: true,
          data: [
            { id: "1", user: "admin", action: "login", timestamp: new Date().toISOString() },
            { id: "2", user: "john", action: "create_loan", timestamp: new Date().toISOString() },
          ],
          count: 2,
          pagination: {
            page: 1,
            pageSize: 10,
            totalPages: 1,
            totalCount: 2,
          },
        };
        break;
        
      case "/sfds":
        // All authenticated users can get SFD list
        responseData = {
          success: true,
          data: [
            { id: "1", name: "SFD Alpha", status: "active" },
            { id: "2", name: "SFD Beta", status: "active" },
          ],
        };
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: "Unknown endpoint" }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 404,
          }
        );
    }

    return new Response(
      JSON.stringify(responseData),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
    
  } catch (error) {
    console.error("Request error:", error.message);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
