
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface RealtimeNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  recipient_id?: string;
  recipient_role?: string;
  sender_id?: string;
  action_link?: string;
  read: boolean;
  created_at: string;
}

export interface NotificationChannel {
  push: boolean;
  email: boolean;
  sms: boolean;
  sound: boolean;
}

export interface NotificationPreferences {
  channels: NotificationChannel;
  language: string;
  categories?: {
    payments: boolean;
    loans: boolean;
    system: boolean;
    marketing: boolean;
  };
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
}: Omit<RealtimeNotification, 'id' | 'read' | 'created_at' | 'sender_id'>) => {
  try {
    // Get the current authenticated user to set as sender
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("No authenticated user found to send notification");
    }
    
    const { data, error } = await supabase
      .from('admin_notifications')
      .insert({
        title,
        message,
        type,
        user_id: recipient_id,
        action_url: action_link
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
      .update({ is_read: true })
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
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(n => ({
      ...n,
      read: n.is_read,
      recipient_id: n.user_id,
      action_link: n.action_url
    })) as RealtimeNotification[];
  } catch (error) {
    console.error('Error fetching notifications:', error);
    throw error;
  }
};

// Get notification preferences
export const getNotificationPreferences = async (): Promise<NotificationPreferences> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    const { data, error } = await supabase.functions.invoke('user_settings', {
      body: { action: 'settings', method: 'GET' }
    });
    
    if (error) throw error;
    
    if (data?.data) {
      return {
        channels: data.data.notifications as NotificationChannel,
        language: data.data.language,
        categories: data.data.categories || {
          payments: true,
          loans: true,
          system: true,
          marketing: false
        }
      };
    }
    
    // Return default preferences if none found
    return {
      channels: {
        push: true,
        email: false,
        sms: true,
        sound: true
      },
      language: 'fr',
      categories: {
        payments: true,
        loans: true,
        system: true,
        marketing: false
      }
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences: NotificationPreferences): Promise<void> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("No authenticated user found");
    }
    
    const { error } = await supabase.functions.invoke('user_settings', {
      body: {
        action: 'settings',
        method: 'POST',
        notifications: preferences.channels,
        language: preferences.language,
        categories: preferences.categories
      }
    });
    
    if (error) throw error;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

// Get notification channels
export const getAvailableChannels = async (): Promise<string[]> => {
  // This would typically come from a backend configuration
  // For now we'll return fixed channels
  return ['push', 'email', 'sms', 'in-app'];
};
