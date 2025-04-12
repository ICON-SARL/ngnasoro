
// Follow Deno Edge Function conventions
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

const corsWrapper = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = corsWrapper(req);
  if (corsResponse) return corsResponse;

  try {
    const { endpoint, method, requestBody } = await req.json();
    
    // Log the request
    console.log(`Integration test request: ${method} ${endpoint}`);
    console.log('Request body:', requestBody);
    
    // This is a mock implementation
    // In production, this would forward the request to your actual API
    
    let mockResponse;
    let status = 200;
    
    // Mock different endpoint responses
    if (endpoint.includes('create-sfd')) {
      mockResponse = {
        success: true,
        sfd: {
          id: "123e4567-e89b-12d3-a456-426614174000",
          name: requestBody.sfd_name,
          code: requestBody.sfd_name.substring(0, 3).toUpperCase(),
          status: "active",
          created_at: new Date().toISOString()
        }
      };
    } else if (endpoint.includes('sfd-admin/create')) {
      mockResponse = {
        success: true,
        admin: {
          id: "123e4567-e89b-12d3-a456-426614174001",
          email: requestBody.admin_email,
          sfd_id: requestBody.sfd_id,
          created_at: new Date().toISOString()
        }
      };
    } else if (endpoint.includes('client-adhesion')) {
      mockResponse = {
        success: true,
        adhesion: {
          id: "123e4567-e89b-12d3-a456-426614174002",
          client_name: requestBody.name,
          sfd_id: requestBody.sfd_id,
          status: "pending",
          created_at: new Date().toISOString()
        }
      };
    } else {
      mockResponse = {
        success: false,
        error: "Unknown endpoint"
      };
      status = 404;
    }
    
    return new Response(
      JSON.stringify({
        result: mockResponse,
        status: status
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in test-integration function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
