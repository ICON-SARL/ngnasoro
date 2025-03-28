
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SubsidyNotification {
  id: string;
  title: string;
  message: string;
  created_at: string;
  read: boolean;
  recipient_id: string;
  recipient_role: string;
  sender_id: string;
  type: string;
  action_link: string;
  request_id?: string; // Made optional to match the database schema
}

export function useSubsidyNotifications(limit = 10) {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const fetchNotifications = async (): Promise<SubsidyNotification[]> => {
    if (!user?.id) return [];
    
    // Use admin_notifications table instead of notifications
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .eq('recipient_id', user.id)
      .eq('recipient_role', userRole)
      .like('type', 'subsidy%')
      .order('created_at', { ascending: false })
      .limit(limit);
      
    if (error) {
      console.error('Error fetching subsidy notifications:', error);
      return [];
    }
    
    return (data || []) as SubsidyNotification[];
  };
  
  const { data: notifications = [], isLoading, error, refetch } = useQuery({
    queryKey: ['subsidy-notifications', user?.id, userRole, limit],
    queryFn: fetchNotifications,
    enabled: !!user?.id,
  });
  
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Refetch notifications after marking as read
      refetch();
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const createRequestNotification = useMutation({
    mutationFn: async (request: any) => {
      if (!request?.id || !request?.sfd_id) {
        throw new Error('Invalid request data for notification');
      }
      
      const notification = {
        title: 'Nouvelle demande de subvention',
        message: `Une nouvelle demande de subvention de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(request.amount)} a été soumise.`,
        recipient_role: 'super_admin',
        sender_id: user?.id || '',
        type: 'subsidy_request',
        read: false,
        action_link: `/subsidy-request/${request.id}`,
        request_id: request.id
      };
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert(notification)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Notification envoyée",
        description: "Les administrateurs ont été notifiés de votre demande",
      });
    },
    onError: (error: any) => {
      console.error('Error creating request notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification",
        variant: "destructive",
      });
    }
  });
  
  const createDecisionNotification = useMutation({
    mutationFn: async (data: { 
      requestId: string;
      sfdAdminId: string;
      status: 'approved' | 'rejected';
      amount: number;
    }) => {
      const { requestId, sfdAdminId, status, amount } = data;
      
      const statusText = status === 'approved' ? 'approuvée' : 'rejetée';
      const notification = {
        title: `Demande de subvention ${statusText}`,
        message: `Votre demande de subvention de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)} a été ${statusText}.`,
        recipient_id: sfdAdminId,
        recipient_role: 'sfd_admin',
        sender_id: user?.id || '',
        type: `subsidy_${status}`,
        read: false,
        action_link: `/subsidy-request/${requestId}`,
        request_id: requestId
      };
      
      const { data: notificationData, error } = await supabase
        .from('admin_notifications')
        .insert(notification)
        .select()
        .single();
        
      if (error) throw error;
      return notificationData;
    },
    onError: (error: any) => {
      console.error('Error creating decision notification:', error);
    }
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    unreadCount,
    refetch,
    createRequestNotification,
    createDecisionNotification
  };
}
