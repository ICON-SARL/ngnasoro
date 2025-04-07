
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipient_id: string;
  sender_id?: string;
  created_at?: string;
  read?: boolean;
}

export function useAdminCommunication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Function to send notification to a specific admin
  const sendNotification = useCallback(async (notification: Notification) => {
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
            sender_id: user.id,
            read: false
          }
        ])
        .select();
      
      if (error) {
        console.error('Error sending notification:', error);
        throw error;
      }
      
      return data[0];
    } catch (err: any) {
      setError(err.message);
      console.error('Error in sendNotification:', err);
      toast({
        title: "Erreur",
        description: `Impossible d'envoyer la notification: ${err.message}`,
        variant: "destructive",
      });
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Function to fetch notifications for current user
  const fetchNotifications = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Vous devez être connecté pour recevoir des notifications');
      }
      
      const { data: userProfile } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', user.id)
        .single();
      
      // If we can't get the user profile, just fetch notifications for this user specifically
      if (!userProfile) {
        const { data, error } = await supabase
          .from('admin_notifications')
          .select('*')
          .eq('recipient_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching notifications:', error);
          throw error;
        }
        
        return data || [];
      }
      
      // Fetch notifications for this user or for their role
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .or(`recipient_id.eq.${user.id},recipient_role.eq.${userProfile.role}`)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notifications:', error);
        throw error;
      }
      
      return data || [];
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching notifications:', err);
      return [];
    } finally {
      setIsLoading(false);
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
    retryFetch,
    isLoading,
    error
  };
}
