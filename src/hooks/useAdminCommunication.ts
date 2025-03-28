
import { useState } from 'react';
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

  const fetchNotifications = async (userId?: string) => {
    if (!userId) return [];
    
    setIsLoading(true);
    
    try {
      // Get notifications where user is specifically the recipient or
      // where the notification is for the user's role
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .or(`recipient_id.eq.${userId},recipient_role.eq.sfd_admin`)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setNotifications(data as AdminNotification[]);
      
      // Count unread notifications
      const unread = data.filter(n => !n.read).length;
      setUnreadCount(unread);
      
      return data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les notifications",
        variant: "destructive"
      });
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

  return {
    notifications,
    unreadCount,
    isLoading,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    sendNotification,
  };
}
