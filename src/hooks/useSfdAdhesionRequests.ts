
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useSfdAdhesionRequests() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

  // Process adhesion request (approve or reject)
  const processAdhesionRequest = async (
    requestId: string,
    action: 'approve' | 'reject',
    notes?: string
  ) => {
    if (!user) {
      return { success: false, error: "User not authenticated" };
    }

    setIsProcessing(true);
    try {
      const status = action === 'approve' ? 'approved' : 'rejected';
      const updateData: any = {
        status,
        processed_by: user.id,
        processed_at: new Date().toISOString()
      };

      // For rejections, include the reason
      if (action === 'reject' && notes) {
        updateData.notes = notes;
        updateData.rejection_reason = notes;
      } else if (action === 'approve' && notes) {
        updateData.notes = notes;
      }

      // Update the adhesion request
      const { error } = await supabase
        .from('client_adhesion_requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      // Log action
      await supabase.from('audit_logs').insert({
        user_id: user.id,
        action: `adhesion_request_${action}ed`,
        category: 'CLIENT_MANAGEMENT',
        status: 'success',
        severity: 'info',
        target_resource: `client_adhesion_requests/${requestId}`,
        details: { requestId, action, notes }
      });

      // Create notification for the client
      const { data: requestData } = await supabase
        .from('client_adhesion_requests')
        .select('user_id, full_name')
        .eq('id', requestId)
        .single();

      if (requestData) {
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

      // If approved, create client entry (this would be handled by a trigger in production)
      if (action === 'approve') {
        // Check if the client entry already exists
        const { data: existingClient } = await supabase
          .from('sfd_clients')
          .select('id')
          .eq('user_id', requestData?.user_id)
          .maybeSingle();

        if (!existingClient) {
          await supabase
            .from('sfd_clients')
            .insert({
              full_name: requestData?.full_name,
              sfd_id: requestData?.sfd_id,
              user_id: requestData?.user_id,
              status: 'active',
              validated_by: user.id,
              validated_at: new Date().toISOString()
            });
        }
      }

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['adhesion-requests'] });
      return { success: true };
    } catch (error: any) {
      console.error('Error processing adhesion request:', error);
      return { 
        success: false, 
        error: error.message || 'Une erreur est survenue lors du traitement de la demande'
      };
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    processAdhesionRequest,
    isProcessing
  };
}
