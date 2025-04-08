
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotificationRequest {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  recipient_id: string;
}

export function useAdminCommunication() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendNotification = async (notification: AdminNotificationRequest) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Call the notification edge function or insert directly into notifications table
      const { data, error: notificationError } = await supabase
        .from('admin_notifications')
        .insert({
          recipient_id: notification.recipient_id,
          title: notification.title,
          message: notification.message,
          type: notification.type,
          is_read: false
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

  return {
    sendNotification,
    isLoading,
    error
  };
}
