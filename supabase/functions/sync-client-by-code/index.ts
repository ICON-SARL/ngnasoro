
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
    const { clientId, clientCode } = await req.json();

    if (!clientId || !clientCode) {
      throw new Error("Client ID and client code are required");
    }
    
    console.log(`Syncing client ${clientId} with user by client code ${clientCode}`);

    // Find user with matching client code
    const { data: profileWithCode, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('client_code', clientCode)
      .single();
    
    if (profileError) {
      console.error("Error finding user by client code:", profileError);
      throw new Error("No user found with this client code");
    }
    
    if (!profileWithCode || !profileWithCode.id) {
      throw new Error("No user found with this client code");
    }
    
    const userId = profileWithCode.id;
    
    console.log(`Found user with ID ${userId} matching client code ${clientCode}`);
    
    // Check if user is already linked to a client in this SFD
    const { data: clientData, error: clientError } = await supabase
      .from('sfd_clients')
      .select('sfd_id')
      .eq('id', clientId)
      .single();
      
    if (clientError) {
      console.error("Error fetching client:", clientError);
      throw clientError;
    }
    
    const sfdId = clientData.sfd_id;
    
    const { data: existingClient, error: existingClientError } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('user_id', userId)
      .eq('sfd_id', sfdId)
      .maybeSingle();
      
    if (existingClientError && existingClientError.code !== 'PGRST116') {
      console.error("Error checking existing client:", existingClientError);
      throw existingClientError;
    }
    
    if (existingClient) {
      throw new Error("This user is already associated with a client in this SFD");
    }
    
    // Update client with the user_id
    const { data: updatedClient, error: updateError } = await supabase
      .from('sfd_clients')
      .update({ 
        user_id: userId,
        client_code: clientCode
      })
      .eq('id', clientId)
      .select()
      .single();
      
    if (updateError) {
      console.error("Error updating client with user ID:", updateError);
      throw updateError;
    }
    
    // Try to create a savings account for the client
    try {
      await supabase.rpc('sync_client_accounts', { 
        p_sfd_id: sfdId,
        p_client_id: clientId
      });
      
      console.log('Created savings account for synchronized user');
    } catch (syncError) {
      console.error('Error syncing client account:', syncError);
      // Continue even if account sync fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Client synchronized with user account successfully",
        client: updatedClient,
        userProfile: profileWithCode
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
