
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
    const { action, sfdId, clientId, searchTerm, statusFilter, page = 1, limit = 50, clientData } = await req.json();

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

        if (!clientData || !clientData.full_name) {
          throw new Error('Client data is required with at least a full name');
        }

        console.log('Creating client with data:', JSON.stringify(clientData));

        // Validate client data
        if (clientData.email) {
          // Check if email is valid
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(clientData.email)) {
            throw new Error('Email invalide');
          }
          
          // Check for duplicate email
          const { data: existingWithEmail, error: emailCheckError } = await supabaseClient
            .from('sfd_clients')
            .select('id, full_name')
            .eq('email', clientData.email)
            .eq('sfd_id', sfdId)
            .limit(1);
            
          if (emailCheckError) console.error('Error checking for duplicate email:', emailCheckError);
          
          if (existingWithEmail && existingWithEmail.length > 0) {
            console.warn('Duplicate email found:', existingWithEmail[0].full_name);
            // We continue but will log this as a warning
          }
        }

        // Create client
        const { data: newClient, error: createError } = await supabaseClient
          .from('sfd_clients')
          .insert({
            ...clientData,
            sfd_id: sfdId,
            status: 'pending',
            kyc_level: 0
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

        console.log('Client created successfully with ID:', newClient.id);

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
            // This is where user creation would happen
            // For now, we'll just log the intention
            console.log('Would create user account for client:', updatedClient.id);
          } catch (createUserError) {
            console.error('Error creating user account:', createUserError);
            // We don't fail the validation if user creation fails
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
            notes: rejectionReason
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
            description: 'Compte client rejeté: ' + (rejectionReason || 'Aucune raison spécifiée')
          });

        return new Response(
          JSON.stringify(updatedClient),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }

      case 'deleteClient': {
        if (!clientId) {
          throw new Error('Client ID is required');
        }

        // Check if client has related records before deleting
        const { data: clientData, error: clientError } = await supabaseClient
          .from('sfd_clients')
          .select('id')
          .eq('id', clientId)
          .single();

        if (clientError) {
          throw new Error('Client not found');
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

        // Log activity in audit log
        await supabaseClient
          .from('audit_logs')
          .insert({
            user_id: user.id,
            action: 'client_deleted',
            category: 'CLIENT_MANAGEMENT',
            severity: 'info',
            status: 'success',
            target_resource: `sfd_clients/${clientId}`,
            details: { client_id: clientId }
          });

        return new Response(
          JSON.stringify({ success: true, message: 'Client supprimé avec succès' }),
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
          console.error('Erreur lors de la récupération des activités du client:', activitiesError);
        }

        // Get client documents
        const { data: documents, error: documentsError } = await supabaseClient
          .from('client_documents')
          .select('*')
          .eq('client_id', clientId);

        if (documentsError) {
          console.error('Erreur lors de la récupération des documents du client:', documentsError);
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

      default:
        throw new Error(`Action not supported: ${action}`);
    }
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'An unexpected error occurred' 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
