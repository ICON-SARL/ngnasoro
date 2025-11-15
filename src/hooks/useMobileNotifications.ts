import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
}

export const useMobileNotifications = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Récupérer les notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['mobile-notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
    refetchInterval: 30000 // Rafraîchir toutes les 30 secondes
  });

  // Compter les notifications non lues
  const unreadCount = notifications.filter(n => !n.is_read).length;

  // Marquer comme lu
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
    }
  });

  // Marquer toutes comme lues
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('user_id', user?.id)
        .eq('is_read', false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
      toast({
        title: "✓ Notifications marquées comme lues",
        duration: 2000
      });
    }
  });

  // Supprimer une notification
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
      toast({
        title: "✓ Notification supprimée",
        duration: 2000
      });
    }
  });

  // Écouter les nouvelles notifications en temps réel
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('mobile-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'admin_notifications',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          
          // Invalider les queries pour rafraîchir
          queryClient.invalidateQueries({ queryKey: ['mobile-notifications'] });
          
          // Afficher un toast moderne
          toast({
            title: newNotification.title,
            description: newNotification.message,
            duration: 5000
          });

          // Vibration légère sur mobile
          if ('vibrate' in navigator) {
            navigator.vibrate(100);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending
  };
};
