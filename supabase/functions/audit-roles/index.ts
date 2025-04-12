
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
    const { roles } = await req.json();
    
    // This is a mock implementation
    // In production, this would query your database
    
    // Mock response data
    const roleData = roles.map((role: string) => ({
      role_name: role,
      can_create_sfd: role === 'SUPER_ADMIN',
      can_manage_admins: true,
      can_approve_loans: role === 'SUPER_ADMIN' || role === 'SFD_ADMIN',
      can_manage_clients: role === 'SUPER_ADMIN' || role === 'SFD_ADMIN'
    }));
    
    // Log the action
    console.log(`Audit roles request received for roles: ${roles.join(', ')}`);
    
    return new Response(
      JSON.stringify(roleData),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error in audit-roles function:", error);
    
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
