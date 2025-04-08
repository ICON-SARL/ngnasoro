
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipient_id?: string;
  recipient_role?: string;
  action_link?: string;
  sender_id?: string;
}

export interface AdminNotification {
  id?: string;
  title: string;
  message: string;
  type: string;
  recipient_id?: string;
  recipient_role?: string;
  sender_id?: string;
  created_at?: string;
  read?: boolean;
  action_link?: string;
}

export function useAdminCommunication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const sendNotification = async (notification: AdminNotificationRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the notification edge function or insert directly into notifications table
      const { data, error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          recipient_id: notification.recipient_id,
          recipient_role: notification.recipient_role,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          read: false,
          sender_id: notification.sender_id || (await supabase.auth.getUser()).data.user?.id,
          action_link: notification.action_link
        });
      
      if (notificationError) throw notificationError;
      
      return data;
    } catch (err: any) {
      console.error("Failed to send notification:", err);
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    
    try {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;
      
      if (!userId) {
        throw new Error("User not authenticated");
      }
      
      const { data, error: fetchError } = await supabase
        .from('admin_notifications')
        .select('*')
        .or(`recipient_id.eq.${userId},recipient_role.eq.${user.data.user?.role || 'null'}`)
        .order('created_at', { ascending: false })
        .limit(50);
      
      if (fetchError) throw fetchError;
      
      setNotifications(data || []);
      setUnreadCount((data || []).filter(n => !n.read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
      
      if (updateError) throw updateError;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
      return false;
    }
  }, []);

  const markAllAsRead = useCallback(async (userId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('recipient_id', userId)
        .is('read', false);
      
      if (updateError) throw updateError;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      return true;
    } catch (err) {
      console.error("Failed to mark all notifications as read:", err);
      return false;
    }
  }, []);

  return {
    sendNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    notifications,
    unreadCount,
    isLoading,
    hasError,
    error
  };
}
