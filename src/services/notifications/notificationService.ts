
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  recipient_id?: string;
  recipient_role?: string;
  action_link?: string;
  read: boolean;
  created_at: string;
}

// Subscribe to real-time notifications
export const subscribeToNotifications = (
  userId: string, 
  userRole: string,
  onNotification: (notification: RealtimeNotification) => void
) => {
  // Subscribe to direct notifications (recipient_id matches)
  const directChannel = supabase
    .channel('direct_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_notifications',
        filter: `recipient_id=eq.${userId}`
      },
      (payload) => {
        console.log('Received direct notification:', payload);
        onNotification(payload.new as RealtimeNotification);
      }
    )
    .subscribe();

  // Subscribe to role-based notifications
  const roleChannel = supabase
    .channel('role_notifications')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_notifications',
        filter: `recipient_role=eq.${userRole}`
      },
      (payload) => {
        console.log('Received role notification:', payload);
        onNotification(payload.new as RealtimeNotification);
      }
    )
    .subscribe();

  // Return cleanup function
  return () => {
    supabase.removeChannel(directChannel);
    supabase.removeChannel(roleChannel);
  };
};

// Send a notification
export const sendNotification = async ({
  title,
  message,
  type,
  recipient_id,
  recipient_role,
  action_link
}: Omit<RealtimeNotification, 'id' | 'read' | 'created_at'>) => {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        title,
        message,
        type,
        recipient_id,
        recipient_role,
        action_link,
        read: false
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const { error } = await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', notificationId);

    if (error) throw error;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Get user's notifications
export const getUserNotifications = async (userId: string, userRole: string) => {
  try {
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .or(`recipient_id.eq.${userId},recipient_role.eq.${userRole}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as RealtimeNotification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};
