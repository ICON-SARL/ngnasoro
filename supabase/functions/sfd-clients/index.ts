
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.8.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with Auth context from the request
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError) {
      throw new Error('Unauthorized: ' + userError.message);
    }

    // Parse request body
    const { action, sfdId, clientId, searchTerm, statusFilter, page = 1, limit = 50 } = await req.json();

    // Log the request details
    console.log(`Received request: action=${action}, sfdId=${sfdId}`);

    // Different actions
    switch (action) {
      case 'getClients': {
        console.log(`Récupération des clients pour la SFD: ${sfdId}`);
        
        if (!sfdId) {
          throw new Error('SFD ID is required');
        }

        // Build query
        let query = supabaseClient
          .from('sfd_clients')
          .select('*')
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });

        // Apply filters if provided
        if (statusFilter) {
          query = query.eq('status', statusFilter);
        }

        if (searchTerm) {
          query = query.or(`full_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
        }

        // Apply pagination
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);

        // Execute query
        const { data, error, count } = await query;

        if (error) {
          console.error('Erreur lors de la récupération des clients:', error);
          throw error;
        }

        // Get total count in a separate query for accurate pagination
        const { count: totalCount, error: countError } = await supabaseClient
          .from('sfd_clients')
          .select('*', { count: 'exact', head: true })
          .eq('sfd_id', sfdId);

        if (countError) {
          console.error('Erreur lors du comptage des clients:', countError);
        }

        return new Response(
          JSON.stringify({
            clients: data || [],
            pagination: {
              page,
              limit,
              total: totalCount || 0,
              pages: totalCount ? Math.ceil(totalCount / limit) : 0
            }
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'createClient': {
        if (!sfdId) {
          throw new Error('SFD ID is required');
        }

        const { clientData } = await req.json();
        if (!clientData || !clientData.full_name) {
          throw new Error('Client data is required with at least a full name');
        }

        // Create client
        const { data: newClient, error: createError } = await supabaseClient
          .from('sfd_clients')
          .insert({
            ...clientData,
            sfd_id: sfdId,
            status: 'pending'
          })
          .select()
          .single();

        if (createError) {
          console.error('Erreur lors de la création du client:', createError);
          throw createError;
        }

        // Log activity
        await supabaseClient
          .from('client_activities')
          .insert({
            client_id: newClient.id,
            activity_type: 'creation',
            performed_by: user.id,
            description: 'Client créé'
          });

        return new Response(
          JSON.stringify(newClient),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'validateClient': {
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        const { validatedBy, notes } = await req.json();

        // Update client status
        const { data: updatedClient, error: updateError } = await supabaseClient
          .from('sfd_clients')
          .update({
            status: 'validated',
            validated_at: new Date().toISOString(),
            validated_by: validatedBy || user.id,
            notes
          })
          .eq('id', clientId)
          .select()
          .single();

        if (updateError) {
          console.error('Erreur lors de la validation du client:', updateError);
          throw updateError;
        }

        // Log activity
        await supabaseClient
          .from('client_activities')
          .insert({
            client_id: clientId,
            activity_type: 'validation',
            performed_by: validatedBy || user.id,
            description: 'Compte client validé'
          });

        // Try to create a user account for the client if it doesn't exist
        if (!updatedClient.user_id && updatedClient.email) {
          try {
            // Create temp password
            const tempPassword = Math.random().toString(36).slice(-8);

            // Call the create_user_from_client function
            const { data: userData, error: userCreateError } = await supabaseClient.rpc(
              'create_user_from_client',
              { 
                client_id: clientId,
                temp_password: tempPassword
              }
            );

            if (userCreateError) {
              console.error('Error creating user account:', userCreateError);
            } else {
              console.log('User account created successfully:', userData);
            }
          } catch (accountError) {
            console.error('Error in account creation process:', accountError);
          }
        }

        return new Response(
          JSON.stringify(updatedClient),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'rejectClient': {
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        const { validatedBy, rejectionReason } = await req.json();

        // Update client status
        const { data: updatedClient, error: updateError } = await supabaseClient
          .from('sfd_clients')
          .update({
            status: 'rejected',
            validated_at: new Date().toISOString(),
            validated_by: validatedBy || user.id,
            notes: rejectionReason || 'Demande rejetée'
          })
          .eq('id', clientId)
          .select()
          .single();

        if (updateError) {
          console.error('Erreur lors du rejet du client:', updateError);
          throw updateError;
        }

        // Log activity
        await supabaseClient
          .from('client_activities')
          .insert({
            client_id: clientId,
            activity_type: 'rejection',
            performed_by: validatedBy || user.id,
            description: rejectionReason || 'Demande de client rejetée'
          });

        return new Response(
          JSON.stringify(updatedClient),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'getClientDetails': {
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        // Get client details
        const { data: client, error: clientError } = await supabaseClient
          .from('sfd_clients')
          .select('*')
          .eq('id', clientId)
          .single();

        if (clientError) {
          console.error('Erreur lors de la récupération des détails du client:', clientError);
          throw clientError;
        }

        // Get client activities
        const { data: activities, error: activitiesError } = await supabaseClient
          .from('client_activities')
          .select('*')
          .eq('client_id', clientId)
          .order('performed_at', { ascending: false });

        if (activitiesError) {
          console.error('Erreur lors de la récupération des activités:', activitiesError);
        }

        // Get client documents
        const { data: documents, error: documentsError } = await supabaseClient
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId);

        if (documentsError) {
          console.error('Erreur lors de la récupération des documents:', documentsError);
        }

        return new Response(
          JSON.stringify({
            client,
            activities: activities || [],
            documents: documents || []
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'deleteClient': {
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        // Check if user has permission (admin or SFD admin)
        const { data: userRole } = await supabaseClient
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (!userRole || (userRole.role !== 'admin' && userRole.role !== 'sfd_admin')) {
          throw new Error('Permission denied: Only admins can delete clients');
        }

        // Delete client
        const { error: deleteError } = await supabaseClient
          .from('sfd_clients')
          .delete()
          .eq('id', clientId);

        if (deleteError) {
          console.error('Erreur lors de la suppression du client:', deleteError);
          throw deleteError;
        }

        return new Response(
          JSON.stringify({ success: true }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      default:
        throw new Error(`Action not supported: ${action}`);
    }
  } catch (error) {
    console.error('Error processing request:', error.message);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
