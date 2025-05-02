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
    const { action, sfdId, clientId, clientData, validatedBy, rejectionReason, searchTerm = '', status, page = 1, pageSize = 10 } = await req.json();

    // Check if the user has permission to manage this SFD's clients
    // For simplicity, we'll just check if the user exists for now
    // In production, you'd want to check specific roles/permissions
    if (!user) {
      throw new Error("Unauthorized: User not found");
    }

    console.log(`Processing ${action} request for sfdId: ${sfdId}`);

    let data = null;
    let error = null;

    // Handle different actions
    switch (action) {
      case 'getClients':
        // Get all clients for this SFD with optional filtering
        let query = supabase
          .from('sfd_clients')
          .select('*')
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });
        
        // Apply filters if provided
        if (status) {
          query = query.eq('status', status);
        }
        
        if (searchTerm) {
          query = query.or(
            `full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,client_code.ilike.%${searchTerm}%`
          );
        }
        
        const { data: clients, error: clientsError } = await query;
        data = clients;
        error = clientsError;
        break;
        
      case 'getClient':
        // Get a specific client
        const { data: client, error: clientError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('id', clientId)
          .eq('sfd_id', sfdId)
          .single();
          
        data = client;
        error = clientError;
        break;
        
      case 'createClient':
        console.log('Creating client with data:', clientData);
        
        // If the client has a user_id, they are an existing user being added as a client
        const isExistingUser = !!clientData.user_id;
        
        // Check for client with same email in the same SFD
        if (clientData.email) {
          const { data: existingClient, error: checkError } = await supabase
            .from('sfd_clients')
            .select('id, full_name, email, status')
            .eq('email', clientData.email)
            .eq('sfd_id', sfdId)
            .maybeSingle();
            
          if (checkError) {
            console.error('Error checking for existing client:', checkError);
          }
          
          // If a client with this email already exists in this SFD, return an error
          if (existingClient) {
            return new Response(
              JSON.stringify({
                error: "Un client avec cet email existe déjà dans cette SFD",
                success: false,
                existingClient: {
                  id: existingClient.id,
                  full_name: existingClient.full_name,
                  status: existingClient.status
                }
              }),
              { headers: { ...corsHeaders }, status: 400 }
            );
          }
        }
        
        // Look for existing user with this email
        let userId = clientData.user_id;
        if (!userId && clientData.email) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('id')
            .ilike('email', clientData.email)
            .maybeSingle();
            
          if (userProfile) {
            userId = userProfile.id;
            console.log(`Found existing user with ID ${userId} for email ${clientData.email}`);
          }
        }
        
        const { data: newClient, error: createError } = await supabase
          .from('sfd_clients')
          .insert({
            ...clientData,
            sfd_id: sfdId,
            user_id: userId, // Use the found user ID or null
            status: isExistingUser || userId ? 'validated' : 'pending',
            validated_at: (isExistingUser || userId) ? new Date().toISOString() : null,
            validated_by: (isExistingUser || userId) ? user.id : null,
          })
          .select()
          .single();
          
        if (createError) {
          console.error('Error creating client:', createError);
          throw createError;
        }
        
        // If the client has a user_id (either provided or found), create a savings account automatically
        if (newClient.user_id) {
          try {
            // Create a savings account for the client
            await supabase.rpc('sync_client_accounts', { 
              p_sfd_id: sfdId,
              p_client_id: newClient.id
            });
            console.log('Created account for client with user_id:', newClient.user_id);
          } catch (syncError) {
            console.error('Error syncing client account:', syncError);
            // Continue even if account sync fails
          }
        } else if (clientData.email) {
          // If no user_id but we have an email, try to sync the client with a new user account
          try {
            // Call the sync-client-user-account function to create user+account
            const { error: syncError } = await supabase.functions.invoke('sync-client-user-account', {
              body: { clientId: newClient.id }
            });
            
            if (syncError) {
              console.error('Error syncing client with user account:', syncError);
            } else {
              console.log('Successfully synced client with user account and created savings account');
            }
          } catch (error) {
            console.error('Exception during client-user sync:', error);
          }
        }
          
        data = newClient;
        break;
        
      case 'validateClient':
        // Validate a client
        const { data: validatedClient, error: validateError } = await supabase
          .from('sfd_clients')
          .update({
            status: 'validated',
            validated_by: validatedBy,
            validated_at: new Date().toISOString()
          })
          .eq('id', clientId)
          .select()
          .single();
          
        // Try to sync the client account (create the account if needed)
        try {
          // First try to sync via RPC
          await supabase.rpc('sync_client_accounts', { 
            p_sfd_id: sfdId,
            p_client_id: clientId
          });
          
          // If the client doesn't have a user_id, try to create one and sync
          if (!validatedClient.user_id) {
            await supabase.functions.invoke('sync-client-user-account', {
              body: { clientId }
            });
          }
        } catch (syncError) {
          console.error("Error syncing client account:", syncError);
          // We'll continue even if syncing fails, as the client is validated
        }
          
        data = validatedClient;
        error = validateError;
        break;
        
      case 'rejectClient':
        // Reject a client
        const { data: rejectedClient, error: rejectError } = await supabase
          .from('sfd_clients')
          .update({
            status: 'rejected',
            validated_by: validatedBy,
            validated_at: new Date().toISOString(),
            notes: rejectionReason || 'Rejected by administrator'
          })
          .eq('id', clientId)
          .select()
          .single();
          
        data = rejectedClient;
        error = rejectError;
        break;
        
      case 'deleteClient':
        // Delete a client
        const { error: deleteError } = await supabase
          .from('sfd_clients')
          .delete()
          .eq('id', clientId);
          
        data = { success: true };
        error = deleteError;
        break;
        
      case 'getClientDetails':
        // Get detailed information about a specific client
        const { data: clientDetails, error: detailsError } = await supabase
          .from('sfd_clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        data = clientDetails;
        error = detailsError;
        break;
        
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    if (error) {
      console.error(`Error processing ${action}:`, error);
      throw error;
    }

    return new Response(
      JSON.stringify(data),
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
