
import React, { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Bell } from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export function NotificationsOverlay() {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  // Get current user's ID
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        setUserId(data.user.id);
      }
    };
    
    getUser();
  }, []);

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('recipient_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setNotifications(data);
        setUnreadCount(data.length);
      }
    };

    fetchNotifications();
  }, [userId]);

  // Subscribe to real-time notifications
  useEffect(() => {
    if (!userId) return;
    
    const channel = supabase
      .channel('notification-updates')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'admin_notifications',
          filter: `recipient_id=eq.${userId}` 
        }, 
        (payload) => {
          const newNotification = payload.new as Notification;
          
          console.log('New notification received:', newNotification);
          
          // Add to local state
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(count => count + 1);
          
          // Show toast notification
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
  }, [userId, toast]);

  const markAsRead = async (id: string) => {
    if (!userId) return;
    
    await supabase
      .from('admin_notifications')
      .update({ read: true })
      .eq('id', id);
      
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(count => count - 1);
  };

  // No visible UI for now, just handles the notifications
  return null;
}
