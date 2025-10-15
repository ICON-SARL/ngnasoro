
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

  // Helper function to validate UUID format
  const isValidUUID = (id: string): boolean => {
    if (!id) return false;
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return uuidPattern.test(id);
  };

  // Function to send notification to a specific admin
  const sendNotification = useCallback(async (notification: AdminNotificationRequest): Promise<SendNotificationResult> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Vous devez être connecté pour envoyer des notifications');
      }
      
      // Validate recipient_id if provided
      if (notification.recipient_id && !isValidUUID(notification.recipient_id)) {
        throw new Error(`Format d'identifiant invalide: ${notification.recipient_id}`);
      }
      
      // Make sure we have either a recipient_id or a recipient_role
      if (!notification.recipient_id && !notification.recipient_role) {
        throw new Error('Aucun destinataire spécifié pour la notification');
      }
      
      // Prepare notification data
      const notificationData = {
        title: notification.title,
        message: notification.message,
        type: notification.type,
        recipient_id: notification.recipient_id,
        recipient_role: notification.recipient_role,
        action_link: notification.action_link,
        sender_id: user.id,
        read: false
      };
      
      console.log("Sending notification:", notificationData);
      
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert([notificationData])
        .select();
      
      if (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
      
      console.log("Notification sent successfully:", data);
      return { success: true, data: data[0] };
    } catch (err: any) {
      setError(err.message);
      console.error('Error in sendNotification:', err);
      toast({
        title: "Erreur de notification",
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
        setUnreadCount(notifs.filter(n => !n.is_read).length);
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
      setUnreadCount(notifs.filter(n => !n.is_read).length);
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
        .update({ is_read: true })
        .eq('id', notificationId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
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
      
      // Update all notifications for this user
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);
        
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
  
  return {
    isLoading,
    error,
    hasError,
    notifications,
    unreadCount,
    sendNotification,
    fetchNotifications,
    markAsRead,
    markAllAsRead
  };
}
