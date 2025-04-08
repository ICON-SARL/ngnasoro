
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | string;
  recipient_id?: string;
  sender_id?: string;
  created_at?: string;
  read?: boolean;
  recipient_role?: string;
  action_link?: string;
}

export interface AdminNotificationRequest {
  title: string;
  message: string;
  type: string;
  recipient_id?: string;
  recipient_role?: string;
  action_link?: string;
}

interface SendNotificationResult {
  success: boolean;
  data?: any;
  error?: string;
}

export function useAdminCommunication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();

  // Function to send notification to a specific admin
  const sendNotification = useCallback(async (notification: AdminNotificationRequest): Promise<SendNotificationResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('You must be logged in to send notifications');
      }
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([
          {
            title: notification.title,
            message: notification.message,
            type: notification.type,
            recipient_id: notification.recipient_id,
            recipient_role: notification.recipient_role,
            action_link: notification.action_link,
            sender_id: user.id,
            read: false
          }
        ])
        .select();
      
      if (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
      
      return { success: true, data: data[0] };
    } catch (err: any) {
      setError(err.message);
      console.error('Error in sendNotification:', err);
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer la notification: ${err.message}`,
        variant: "destructive",
      });
      return { success: false, error: err.message };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Function to fetch notifications for current user
  const fetchNotifications = useCallback(async (userId?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      setHasError(false);
      
      // Get current user if userId not provided
      let currentUserId = userId;
      if (!currentUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Vous devez être connecté pour recevoir des notifications');
        }
        currentUserId = user.id;
      }
      
      // Get user profile to determine role
      const { data: userProfile } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', currentUserId)
        .single();
      
      // If we can't get the user profile, just fetch notifications for this user specifically
      if (!userProfile) {
        const { data, error } = await supabase
          .from('admin_notifications')
          .select('*')
          .eq('recipient_id', currentUserId)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching notifications:', error);
          setHasError(true);
          throw error;
        }
        
        const notifs = data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter(n => !n.read).length);
        return notifs;
      }
      
      // Fetch notifications for this user or for their role
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .or(`recipient_id.eq.${currentUserId},recipient_role.eq.${userProfile.role}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        setHasError(true);
        throw error;
      }
      
      const notifs = data || [];
      setNotifications(notifs);
      setUnreadCount(notifs.filter(n => !n.read).length);
      return notifs;
    } catch (err: any) {
      setError(err.message);
      setHasError(true);
      console.error('Error fetching notifications:', err);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async (userId: string) => {
    try {
      // Get user profile to determine role
      const { data: userProfile } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', userId)
        .single();
        
      if (!userProfile) return false;
      
      // Update all notifications for this user or their role
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .or(`recipient_id.eq.${userId},recipient_role.eq.${userProfile.role}`)
        .eq('read', false);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  }, []);

  // Function to retry fetch with exponential backoff
  const retryFetch = useCallback(async (
    fn: () => Promise<any>, 
    maxRetries = 3, 
    delay = 1000
  ) => {
    let retries = 0;
    while (retries < maxRetries) {
      try {
        return await fn();
      } catch (err) {
        retries++;
        if (retries >= maxRetries) {
          throw err;
        }
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, retries - 1)));
      }
    }
  }, []);

  return {
    sendNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    retryFetch,
    notifications,
    unreadCount,
    hasError,
    isLoading,
    error
  };
}
