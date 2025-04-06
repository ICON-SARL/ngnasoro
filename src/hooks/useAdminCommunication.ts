
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';

export type AdminNotificationRequest = {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'action_required';
  recipient_id?: string;
  recipient_role?: string;
  action_link?: string;
};

export type AdminNotification = {
  id: string;
  created_at: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'critical' | 'action_required';
  recipient_id?: string;
  recipient_role?: string;
  sender_id: string;
  read: boolean;
  action_link?: string;
};

export function useAdminCommunication() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hasError, setHasError] = useState(false);

  const fetchNotifications = async (userId?: string) => {
    if (!userId) return [];
    
    setIsLoading(true);
    setHasError(false);
    
    try {
      // Get notifications where user is specifically the recipient or
      // where the notification is for the user's role
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .or(`recipient_id.eq.${userId},recipient_role.eq.sfd_admin`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      const notificationsData = data as AdminNotification[];
      setNotifications(notificationsData);
      
      // Count unread notifications
      const unread = notificationsData.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      return notificationsData;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setHasError(true);
      // Ne pas afficher de toast à chaque échec de chargement
      // pour éviter les multiples messages d'erreur
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      
      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - 1));
      
      return true;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  };

  const markAllAsRead = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .or(`recipient_id.eq.${userId},recipient_role.eq.sfd_admin`)
        .eq('read', false);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      // Reset unread count
      setUnreadCount(0);
      
      return true;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      return false;
    }
  };

  const sendNotification = async (notification: AdminNotificationRequest) => {
    if (!user) {
      throw new Error('Utilisateur non authentifié');
    }
    
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .insert({
          title: notification.title,
          message: notification.message,
          type: notification.type,
          recipient_id: notification.recipient_id,
          recipient_role: notification.recipient_role,
          sender_id: user.id,
          action_link: notification.action_link,
          read: false
        })
        .select()
        .single();
        
      if (error) throw error;
      
      return { success: true, data };
    } catch (error) {
      console.error('Error sending notification:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer la notification",
        variant: "destructive"
      });
      return { success: false, error };
    }
  };

  // Utiliser retryFetch pour réessayer le chargement en cas d'échec réseau
  const retryFetch = async (userId?: string, maxRetries = 1) => {
    let retries = 0;
    let success = false;
    
    while (retries <= maxRetries && !success) {
      try {
        await fetchNotifications(userId);
        success = true;
      } catch (error) {
        console.log(`Retry attempt ${retries + 1} failed.`);
        retries++;
        if (retries <= maxRetries) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    hasError,
    fetchNotifications: retryFetch,
    markAsRead,
    markAllAsRead,
    sendNotification,
  };
}
