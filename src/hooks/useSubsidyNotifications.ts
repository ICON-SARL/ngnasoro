
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

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
  
  const fetchNotifications = async (): Promise<SubsidyNotification[]> => {
    if (!user?.id) return [];
    
    const { data, error } = await supabase
      .from('notifications')
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
    
    // Type assertion to handle potential missing request_id
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
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Refetch notifications after marking as read
      refetch();
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  return {
    notifications,
    isLoading,
    error,
    markAsRead,
    unreadCount,
    refetch
  };
}
