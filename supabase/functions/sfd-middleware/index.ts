
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { decode, validate } from 'https://deno.land/x/djwt@v2.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sfd-id, x-sfd-token, x-user-role',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Define the routes that are accessible for each role
const roleAccessibleRoutes = {
  'admin': ['/api/subventions', '/api/loans', '/api/apply-loan', '/api/sfd'],
  'sfd_admin': ['/api/loans', '/api/apply-loan', '/api/sfd'],
  'user': ['/api/apply-loan', '/api/sfd/public'],
};

// Define the routes that are accessible for each SFD
const sfdAccessibleRoutes: Record<string, string[]> = {
  // Default routes accessible for all SFDs
  '*': ['/api/sfd/public', '/api/sfd/auth'],
};

// Function to check if a user has access to the requested endpoint based on role
const hasEndpointAccess = (role: string, endpoint: string): boolean => {
  const allowedRoutes = roleAccessibleRoutes[role as keyof typeof roleAccessibleRoutes] || [];
  
  // Check if any route prefix matches the requested endpoint
  return allowedRoutes.some(route => endpoint.startsWith(route));
};

// Function to check if an SFD admin has access to a specific SFD endpoint
const hasSfdAccessRights = (role: string, userSfdId: string, requestedSfdId: string, endpoint: string): boolean => {
  // Super admins have access to all SFDs
  if (role === 'admin') return true;
  
  // SFD admins only have access to their assigned SFD
  if (role === 'sfd_admin') {
    // Extract SFD ID from endpoint like /api/loans/{sfd-id}/...
    const endpointParts = endpoint.split('/');
    const sfdIdIndex = endpointParts.findIndex(part => part === 'loans') + 1;
    
    if (sfdIdIndex > 0 && sfdIdIndex < endpointParts.length) {
      const endpointSfdId = endpointParts[sfdIdIndex];
      return userSfdId === endpointSfdId;
    }
    
    // If no specific SFD ID in the URL, check if using the provided SFD ID header
    return userSfdId === requestedSfdId;
  }
  
  return false;
};

// Extract and validate SFD JWT token
async function extractAndValidateToken(req: Request): Promise<{ userId: string; sfdId: string; role: string } | null> {
  const authorization = req.headers.get('Authorization') || '';
  const sfdIdHeader = req.headers.get('x-sfd-id');
  const userRoleHeader = req.headers.get('x-user-role');
  
  if (!authorization || !authorization.startsWith('Bearer ') || !sfdIdHeader || !userRoleHeader) {
    return null;
  }
  
  try {
    const token = authorization.split(' ')[1];
    
    // In a real implementation, you would verify this token with the secret key
    // For this demo, we're just decoding it
    const [header, payload] = decode(token);
    
    // Verify that the SFD ID in the token matches the header
    if (payload.sfdId !== sfdIdHeader) {
      console.error('SFD ID mismatch:', payload.sfdId, sfdIdHeader);
      return null;
    }
    
    return { 
      userId: payload.userId,
      sfdId: payload.sfdId,
      role: userRoleHeader
    };
  } catch (error) {
    console.error('Token validation error:', error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }
  
  try {
    const url = new URL(req.url);
    const endpoint = url.pathname;
    
    // Extract and validate the token
    const tokenData = await extractAndValidateToken(req);
    
    if (!tokenData) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: Invalid or missing authentication information' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Check if the user has access to the requested endpoint based on role
    if (!hasEndpointAccess(tokenData.role, endpoint)) {
      return new Response(JSON.stringify({ 
        error: 'Forbidden: Insufficient permissions to access this endpoint',
        role: tokenData.role,
        endpoint: endpoint
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // For SFD-specific endpoints, check if the user has access to the requested SFD
    if (endpoint.includes('/loans/') && !hasSfdAccessRights(tokenData.role, tokenData.sfdId, req.headers.get('x-sfd-id') || '', endpoint)) {
      return new Response(JSON.stringify({ 
        error: 'Forbidden: You do not have access to the requested SFD resources',
        role: tokenData.role,
        sfdId: tokenData.sfdId,
        endpoint: endpoint
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Special check for subventions endpoint - only admins can access
    if (endpoint.startsWith('/api/subventions') && tokenData.role !== 'admin') {
      return new Response(JSON.stringify({ 
        error: 'Forbidden: Only Super Admins can access subsidy information',
        role: tokenData.role,
        endpoint: endpoint
      }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // If we reach here, access is granted
    // In a real implementation, you would forward the request to the actual service
    return new Response(JSON.stringify({ 
      message: 'Access granted',
      userId: tokenData.userId,
      sfdId: tokenData.sfdId,
      role: tokenData.role,
      endpoint: endpoint
    }), { 
      status: 200, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      details: error.message 
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }
});
