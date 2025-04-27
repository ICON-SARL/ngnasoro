
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader) {
      throw new Error("Unauthorized: Auth header missing");
    }

    // Create Supabase client with auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    // Verify the token to get the user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error("Unauthorized: Auth session missing!");
    }

    // Parse the request body
    const { clientCode, sfdId } = await req.json();

    if (!clientCode) {
      throw new Error("Client code is required");
    }

    console.log(`Looking up client by code: ${clientCode} for SFD: ${sfdId || 'any'}`);

    // Use the new RPC function
    const { data: clientData, error: clientError } = await supabase
      .rpc('get_sfd_client_by_code', {
        p_client_code: clientCode,
        p_sfd_id: sfdId
      });
      
    if (clientError) {
      console.error('Error calling get_sfd_client_by_code:', clientError);
      
      // Fall back to normal lookup if RPC fails
      const fallbackResult = await lookupClientFallback(supabase, clientCode, sfdId);
      return new Response(
        JSON.stringify(fallbackResult),
        { headers: { ...corsHeaders }, status: 200 }
      );
    }
    
    if (clientData) {
      return new Response(
        JSON.stringify({ 
          found: true,
          client: clientData,
          source: 'rpc'
        }),
        { headers: { ...corsHeaders }, status: 200 }
      );
    }
    
    // If RPC returns null, try fallback lookup
    const fallbackResult = await lookupClientFallback(supabase, clientCode, sfdId);
    return new Response(
      JSON.stringify(fallbackResult),
      { headers: { ...corsHeaders }, status: 200 }
    );
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(
      JSON.stringify({
        error: error.message || "An unknown error occurred",
        success: false
      }),
      { 
        headers: { ...corsHeaders }, 
        status: error.message.includes("Unauthorized") ? 401 : 400 
      }
    );
  }
});

// Fallback lookup function if RPC fails
async function lookupClientFallback(supabase, clientCode, sfdId) {
  // First check if client exists in the specified SFD
  let sfdClientsQuery = supabase
    .from('sfd_clients')
    .select(`
      *,
      user_id,
      profiles:user_id (
        id,
        full_name,
        email,
        phone,
        client_code
      )
    `)
    .eq('client_code', clientCode);
  
  // Filter by SFD ID if provided
  if (sfdId) {
    sfdClientsQuery = sfdClientsQuery.eq('sfd_id', sfdId);
  }
  
  const { data: sfdClientData, error: sfdClientError } = await sfdClientsQuery.maybeSingle();
  
  if (sfdClientError && sfdClientError.code !== 'PGRST116') {
    console.error('Error checking sfd_clients:', sfdClientError);
    throw sfdClientError;
  }
  
  if (sfdClientData) {
    return {
      found: true,
      client: sfdClientData,
      source: 'sfd_clients',
      isCurrentSfd: sfdId ? sfdClientData.sfd_id === sfdId : undefined
    };
  }
  
  // If not found directly, check profiles table
  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('client_code', clientCode)
    .maybeSingle();
  
  if (profileError && profileError.code !== 'PGRST116') {
    console.error('Error checking profiles:', profileError);
    throw profileError;
  }
  
  if (profileData) {
    // Check if this user is already a client in any SFD
    const { data: userClientData } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('user_id', profileData.id)
      .maybeSingle();
    
    // Return the profile data
    return {
      found: true,
      profile: profileData,
      client: userClientData || null,
      source: 'profiles',
      isCurrentSfd: userClientData && sfdId ? userClientData.sfd_id === sfdId : false
    };
  }
  
  // Not found in either table
  return { found: false };
}
