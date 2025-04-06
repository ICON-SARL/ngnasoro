
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SubsidyRequestNotificationParams {
  request: {
    id: string;
    purpose: string;
    amount: number;
    sfd_name?: string;
  }
}

export interface SubsidyDecisionNotificationParams {
  requestId: string;
  sfdAdminId: string;
  status: 'approved' | 'rejected';
  amount: number;
}

export function useSubsidyNotifications() {
  const { toast } = useToast();
  
  // Create notification for new subsidy request
  const createRequestNotification = useMutation({
    mutationFn: async (request: any) => {
      try {
        const { data, error } = await supabase.from('admin_notifications').insert({
          title: 'Nouvelle demande de subvention',
          message: `Une nouvelle demande de subvention de ${request.amount.toLocaleString()} FCFA a été soumise par ${request.sfd_name || 'une SFD'}.`,
          type: request.priority === 'urgent' || request.priority === 'high' ? 'warning' : 'info',
          recipient_role: 'meref_admin',
          sender_id: request.requested_by,
          action_link: `/admin/subsidy-requests?id=${request.id}`
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating request notification:', error);
        toast({
          title: 'Erreur de notification',
          description: 'La notification n\'a pas pu être envoyée aux administrateurs',
          variant: 'destructive',
        });
        return null;
      }
    }
  });
  
  // Create notification for subsidy decision
  const createDecisionNotification = useMutation({
    mutationFn: async ({ requestId, sfdAdminId, status, amount }: SubsidyDecisionNotificationParams) => {
      try {
        const { data, error } = await supabase.from('admin_notifications').insert({
          title: `Demande de subvention ${status === 'approved' ? 'approuvée' : 'rejetée'}`,
          message: status === 'approved' 
            ? `Votre demande de subvention de ${amount.toLocaleString()} FCFA a été approuvée.`
            : `Votre demande de subvention de ${amount.toLocaleString()} FCFA a été rejetée.`,
          type: status === 'approved' ? 'success' : 'warning',
          recipient_id: sfdAdminId,
          sender_id: (await supabase.auth.getUser()).data.user?.id,
          action_link: `/sfd/subsidy-requests/${requestId}`
        });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error creating decision notification:', error);
        toast({
          title: 'Erreur de notification',
          description: 'La notification n\'a pas pu être envoyée à la SFD',
          variant: 'destructive',
        });
        return null;
      }
    }
  });
  
  return {
    createRequestNotification,
    createDecisionNotification
  };
}
