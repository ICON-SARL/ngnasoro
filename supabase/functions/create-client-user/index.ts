
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
    const { clientId } = await req.json();

    if (!clientId) {
      throw new Error("Client ID is required");
    }
    
    console.log(`Creating user account for client: ${clientId}`);

    // Generate a temporary password
    const tempPassword = Math.random().toString(36).substring(2, 10);
    
    // Call the database function to create the user
    const { data, error } = await supabase.rpc('create_user_from_client', {
      client_id: clientId,
      temp_password: tempPassword
    });
    
    if (error) {
      console.error("Error creating user account:", error);
      throw error;
    }
    
    // Get the updated client info with the user_id
    const { data: updatedClient, error: clientError } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .single();
      
    if (clientError) {
      console.error("Error fetching updated client:", clientError);
      throw clientError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "User account created successfully",
        client: updatedClient,
        tempPassword
      }),
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
