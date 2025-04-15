
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  RealtimeNotification,
  subscribeToNotifications,
  getUserNotifications,
  markNotificationAsRead
} from '@/services/notifications/notificationService';

export const useNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Get user's role from auth context
  const userRole = user?.role || 'user';

  // Initial fetch of notifications
  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const data = await getUserNotifications(user.id, userRole);
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Erreur de chargement",
          description: "Impossible de charger les notifications",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [user?.id, userRole]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id) return;

    const handleNewNotification = (notification: RealtimeNotification) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show toast for new notification
      toast({
        title: notification.title,
        description: notification.message,
        variant: notification.type === 'warning' ? 'destructive' : 'default',
      });
    };

    const unsubscribe = subscribeToNotifications(
      user.id,
      userRole,
      handleNewNotification
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id, userRole]);

  // Mark notification as read
  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Erreur",
        description: "Impossible de marquer la notification comme lue",
        variant: "destructive",
      });
    }
  };

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: handleMarkAsRead
  };
};
