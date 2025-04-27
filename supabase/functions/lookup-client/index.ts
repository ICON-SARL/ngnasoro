
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error("Unauthorized: Auth header missing");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false
      }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      throw new Error("Unauthorized: Auth session missing!");
    }

    const { clientCode, sfdId } = await req.json();

    if (!clientCode) {
      throw new Error("Client code is required");
    }

    console.log(`Looking up client by code: ${clientCode} for SFD: ${sfdId || 'any'}`);

    const { data: clientData, error: clientError } = await supabase
      .rpc('lookup_client_with_sfd', {
        p_client_code: clientCode,
        p_sfd_id: sfdId
      });

    if (clientError) {
      console.error('Error calling lookup_client_with_sfd:', clientError);
      throw clientError;
    }
    
    if (clientData) {
      return new Response(
        JSON.stringify({ 
          found: true,
          client: clientData,
          source: 'lookup_function'
        }),
        { headers: { ...corsHeaders }, status: 200 }
      );
    }
    
    return new Response(
      JSON.stringify({ found: false }),
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
