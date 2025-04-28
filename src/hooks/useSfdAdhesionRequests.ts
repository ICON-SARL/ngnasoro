import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from './useAuth';
import { AdhesionRequestInput } from '@/types/adhesionTypes';

export function useSfdAdhesionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const processAdhesionRequest = async (
    requestId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsProcessing(true);
    console.log(`Processing adhesion request ${requestId} with action ${action}`);
    
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const updateData: any = {
        status,
        processed_by: user.id,
        processed_at: new Date().toISOString()
      };

      if (action === 'reject' && notes) {
        updateData.notes = notes;
        updateData.rejection_reason = notes;
      } else if (action === 'approve' && notes) {
        updateData.notes = notes;
      }

      // Update the request status
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) {
        console.error('Error updating adhesion request:', error);
        throw error;
      }

      // Log the action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: `adhesion_request_${action}ed`,
        category: 'CLIENT_MANAGEMENT',
        status: 'success',
        severity: 'info',
        target_resource: `client_adhesion_requests/${requestId}`,
        details: { requestId, action, notes }
      });

      // Get the request data for notifications
      const { data: requestData } = await supabase
        .from('client_adhesion_requests')
        .select('user_id, full_name, sfd_id')
        .eq('id', requestId)
        .single();

      if (requestData) {
        // Create notification for the client
        await supabase.from('admin_notifications').insert({
          recipient_id: requestData.user_id,
          sender_id: user.id,
          title: action === 'approve' ? 'Demande approuvée' : 'Demande rejetée',
          message: action === 'approve' 
            ? 'Votre demande d\'adhésion a été approuvée' 
            : `Votre demande d'adhésion a été rejetée. ${notes ? 'Raison: ' + notes : ''}`,
          type: `adhesion_${action}d`,
          action_link: '/mobile-flow/account'
        });
      }

      // If approved, create client record and account
      if (action === 'approve' && requestData) {
        console.log(`Creating client record for user ${requestData.user_id} in SFD ${requestData.sfd_id}`);
        
        // Check if client already exists
        const { data: existingClient } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', requestData.user_id)
          .eq('sfd_id', requestData.sfd_id)
          .maybeSingle();

        if (!existingClient) {
          // Create new client record
          const { error: clientError } = await supabase
            .from('sfd_clients')
            .insert({
              full_name: requestData.full_name,
              sfd_id: requestData.sfd_id,
              user_id: requestData.user_id,
              status: 'active',
              validated_by: user.id,
              validated_at: new Date().toISOString()
            });
            
          if (clientError) {
            console.error('Error creating client record:', clientError);
            throw clientError;
          }
          
          console.log('Client record created successfully');
          
          // Create account for the client if it doesn't exist
          const { data: existingAccount } = await supabase
            .from('accounts')
            .select('id')
            .eq('user_id', requestData.user_id)
            .maybeSingle();
            
          if (!existingAccount) {
            console.log(`Creating account for user ${requestData.user_id}`);
            const { error: accountError } = await supabase
              .from('accounts')
              .insert({
                user_id: requestData.user_id,
                balance: 0,
                currency: 'FCFA',
                sfd_id: requestData.sfd_id
              });
              
            if (accountError) {
              console.error('Error creating client account:', accountError);
              // Don't throw here, just log the error as the client is already created
              // We can try to create the account later
            } else {
              console.log('Client account created successfully');
            }
          } else {
            console.log(`Account already exists for user ${requestData.user_id}`);
          }
          
          // Create user_sfds relationship
          const { data: existingUserSfd } = await supabase
            .from('user_sfds')
            .select('id')
            .eq('user_id', requestData.user_id)
            .eq('sfd_id', requestData.sfd_id)
            .maybeSingle();
            
          if (!existingUserSfd) {
            console.log(`Creating user_sfds relationship for user ${requestData.user_id} and SFD ${requestData.sfd_id}`);
            
            // Count existing user_sfds to determine if this should be default
            const { count } = await supabase
              .from('user_sfds')
              .select('id', { count: 'exact' })
              .eq('user_id', requestData.user_id);
              
            const isDefault = count === 0; // Make default if first SFD
            
            const { error: sfdRelError } = await supabase
              .from('user_sfds')
              .insert({
                user_id: requestData.user_id,
                sfd_id: requestData.sfd_id,
                is_default: isDefault
              });
              
            if (sfdRelError) {
              console.error('Error creating user_sfds relationship:', sfdRelError);
              // Don't throw here, just log the error
            } else {
              console.log('User_sfds relationship created successfully');
            }
          } else {
            console.log(`User_sfds relationship already exists for user ${requestData.user_id} and SFD ${requestData.sfd_id}`);
          }
        } else {
          console.log(`Client already exists with ID ${existingClient.id}`);
          
          // Update client status to active if it wasn't
          await supabase
            .from('sfd_clients')
            .update({
              status: 'active',
              validated_by: user.id,
              validated_at: new Date().toISOString()
            })
            .eq('id', existingClient.id);
        }
      }

      // Invalidate related queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
      return { success: true };
    } catch (error: any) {
      console.error('Error processing adhesion request:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors du traitement de la demande',
        variant: 'destructive',
      });
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors du traitement de la demande'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAdhesionRequest = async (sfdId: string, input: AdhesionRequestInput) => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .insert({
          sfd_id: sfdId,
          user_id: user.id,
          full_name: input.full_name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          profession: input.profession || null,
          monthly_income: input.monthly_income ? parseFloat(input.monthly_income) : null,
          source_of_income: input.source_of_income || null,
          status: 'pending',
          reference_number: `ADH-${Date.now().toString().substring(6)}`
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'adhesion_request_submitted',
        category: 'CLIENT_MANAGEMENT',
        status: 'success',
        severity: 'info',
        target_resource: `client_adhesion_requests/${data.id}`,
        details: { sfdId, clientName: input.full_name }
      });

      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
      return { success: true, data };
    } catch (error: any) {
      console.error('Error submitting adhesion request:', error);
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de la soumission de la demande' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateAdhesionRequest = async (requestId: string, input: AdhesionRequestInput) => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .update({
          full_name: input.full_name,
          email: input.email || null,
          phone: input.phone || null,
          address: input.address || null,
          profession: input.profession || null,
          monthly_income: input.monthly_income ? parseFloat(input.monthly_income) : null,
          source_of_income: input.source_of_income || null,
          // Si une demande a été rejetée et qu'on la modifie, on la remet en statut "en attente"
          status: 'pending',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: 'adhesion_request_updated',
        category: 'CLIENT_MANAGEMENT',
        status: 'success',
        severity: 'info',
        target_resource: `client_adhesion_requests/${requestId}`,
        details: { requestId, clientName: input.full_name }
      });

      queryClient.invalidateQueries({ queryKey: ['user-adhesion-requests'] });
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });

      return { success: true, data };
    } catch (error: any) {
      console.error('Error updating adhesion request:', error);
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors de la mise à jour de la demande' 
      };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    processAdhesionRequest,
    isProcessing,
    submitAdhesionRequest,
    updateAdhesionRequest,
    isSubmitting
  };
}
