
import { serve } from 'https://deno.land/std@0.131.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';
import { decode, validate } from 'https://deno.land/x/djwt@v2.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-sfd-id, x-sfd-token',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

// Define the routes that are accessible for each SFD
const sfdAccessibleRoutes: Record<string, string[]> = {
  // Default routes accessible for all SFDs
  '*': ['/api/sfd/public', '/api/sfd/auth'],
};

// Function to check if a user has access to the requested endpoint
const hasEndpointAccess = (sfdId: string, endpoint: string): boolean => {
  // Check if there are specific routes for this SFD
  const sfdRoutes = sfdAccessibleRoutes[sfdId] || [];
  
  // Include global routes available to all SFDs
  const globalRoutes = sfdAccessibleRoutes['*'] || [];
  
  // Combine specific and global routes
  const accessibleRoutes = [...sfdRoutes, ...globalRoutes];
  
  // Check if any route prefix matches the requested endpoint
  return accessibleRoutes.some(route => endpoint.startsWith(route));
};

// Extract and validate SFD JWT token
async function extractAndValidateSfdToken(req: Request): Promise<{ userId: string; sfdId: string } | null> {
  const authorization = req.headers.get('Authorization') || '';
  const sfdIdHeader = req.headers.get('x-sfd-id');
  
  if (!authorization || !authorization.startsWith('Bearer ') || !sfdIdHeader) {
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
      sfdId: payload.sfdId
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
    
    // Extract and validate the SFD JWT token
    const tokenData = await extractAndValidateSfdToken(req);
    
    if (!tokenData) {
      return new Response(JSON.stringify({ 
        error: 'Unauthorized: Invalid or missing SFD token' 
      }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      });
    }
    
    // Check if the user has access to the requested endpoint for the specified SFD
    if (!hasEndpointAccess(tokenData.sfdId, endpoint)) {
      return new Response(JSON.stringify({ 
        error: 'Forbidden: Access denied to this endpoint for the specified SFD',
        sfdId: tokenData.sfdId,
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
