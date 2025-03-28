
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { SubsidyRequest } from '@/types/subsidyRequests';

interface SubsidyNotification {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: 'subsidy_request' | 'subsidy_approved' | 'subsidy_rejected';
  action_link?: string;
  read: boolean;
  request_id: string;
}

export function useSubsidyNotifications() {
  const { user, isSfdAdmin, isAdmin } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch notifications for the current user based on their role
  const fetchNotifications = async (): Promise<SubsidyNotification[]> => {
    if (!user?.id) return [];
    
    let query = supabase
      .from('admin_notifications')
      .select('*');
      
    if (isAdmin) {
      // Super admins see all notifications addressed to them or to the admin role
      query = query.or(`recipient_id.eq.${user.id},recipient_role.eq.admin`);
    } else if (isSfdAdmin) {
      // SFD admins only see notifications addressed to them
      query = query.eq('recipient_id', user.id);
    } else {
      return [];
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notifications:', error);
      return [];
    }
    
    return data as SubsidyNotification[];
  };
  
  // Query for notifications
  const notificationsQuery = useQuery({
    queryKey: ['subsidy-notifications', user?.id],
    queryFn: fetchNotifications,
    enabled: !!user?.id && (isAdmin || isSfdAdmin),
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  // Create notification when SFD Admin submits a request
  const createRequestNotification = useMutation({
    mutationFn: async (request: SubsidyRequest) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      // Create notification for super admins
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          recipient_role: 'admin',
          sender_id: user.id,
          title: 'Nouvelle demande de subvention',
          message: `Une nouvelle demande de subvention de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(request.amount)} a été soumise.`,
          type: 'subsidy_request',
          action_link: `/subsidy-requests/${request.id}`
        });
        
      if (error) throw error;
      
      return request;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-notifications'] });
      toast({
        title: "Notification envoyée",
        description: "Les administrateurs ont été notifiés de votre demande.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification.",
        variant: "destructive",
      });
    }
  });
  
  // Create notification when Super Admin approves/rejects a request
  const createDecisionNotification = useMutation({
    mutationFn: async ({ 
      requestId, 
      sfdAdminId, 
      status, 
      amount 
    }: { 
      requestId: string; 
      sfdAdminId: string; 
      status: 'approved' | 'rejected'; 
      amount: number;
    }) => {
      if (!user?.id) throw new Error("User not authenticated");
      
      const statusText = status === 'approved' ? 'approuvée' : 'rejetée';
      const type = status === 'approved' ? 'subsidy_approved' : 'subsidy_rejected';
      
      // Create notification for the SFD admin
      const { error } = await supabase
        .from('admin_notifications')
        .insert({
          recipient_id: sfdAdminId,
          sender_id: user.id,
          title: `Demande de subvention ${statusText}`,
          message: `Votre demande de subvention de ${new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(amount)} a été ${statusText}.`,
          type,
          action_link: `/subsidy-requests/${requestId}`
        });
        
      if (error) throw error;
      
      return { requestId, status };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-notifications'] });
      toast({
        title: "Notification envoyée",
        description: "L'administrateur SFD a été notifié de votre décision.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification.",
        variant: "destructive",
      });
    }
  });
  
  // Mark notification as read
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      return notificationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subsidy-notifications'] });
    }
  });
  
  return {
    notifications: notificationsQuery.data || [],
    unreadCount: (notificationsQuery.data || []).filter(n => !n.read).length,
    isLoading: notificationsQuery.isLoading,
    createRequestNotification,
    createDecisionNotification,
    markAsRead,
  };
}
