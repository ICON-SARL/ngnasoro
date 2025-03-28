
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type AdminNotification = {
  id: string;
  sender_id: string;
  recipient_id: string | null;
  recipient_role: string | null;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'action_required';
  read: boolean;
  action_link?: string;
  created_at: string;
}

export type AdminNotificationRequest = {
  recipient_id?: string;
  recipient_role?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'action_required';
  action_link?: string;
}

export const useAdminCommunication = () => {
  const { user, isAdmin } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch notifications for the current user
  useEffect(() => {
    if (!user) return;
    
    const fetchNotifications = async () => {
      setIsLoading(true);
      try {
        // Fetch notifications that are either sent directly to this user
        // or sent to a role that this user has
        const { data, error } = await supabase
          .from('admin_notifications')
          .select('*')
          .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setNotifications(data as AdminNotification[]);
          setUnreadCount(data.filter(n => !n.read).length);
        }
      } catch (error) {
        console.error('Error fetching admin notifications:', error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les notifications",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('admin_notifications_changes')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_notifications',
          filter: `recipient_id=eq.${user.id}` 
        }, 
        (payload) => {
          const newNotification = payload.new as AdminNotification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);
          
          // Show toast for new notification
          toast({
            title: newNotification.title,
            description: newNotification.message,
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);
  
  // Send a notification to an admin or role
  const sendNotification = async (notification: AdminNotificationRequest) => {
    if (!user) return { success: false, error: "User not authenticated" };
    
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert({
          sender_id: user.id,
          recipient_id: notification.recipient_id || null,
          recipient_role: notification.recipient_role || null,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          action_link: notification.action_link,
          read: false
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return { success: true, notification: data };
    } catch (error) {
      console.error('Error sending notification:', error);
      return { success: false, error };
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return { success: true };
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return { success: false, error };
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('recipient_id', user?.id)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      return { success: true };
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return { success: false, error };
    }
  };
  
  return {
    notifications,
    unreadCount,
    isLoading,
    sendNotification,
    markAsRead,
    markAllAsRead
  };
};
