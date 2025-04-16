
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to listen for realtime permission updates
 */
export function useRealtimePermissions(userId: string | null, onUpdate: () => void) {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to the user_roles channel for this user
    const channel = supabase
      .channel(`user_roles:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        },
        () => {
          console.log('Received realtime update for user roles');
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onUpdate]);
}

/**
 * Function to request a permission update broadcast
 */
export async function broadcastPermissionsUpdate(userId: string) {
  try {
    const { error } = await supabase.functions.invoke('auth-manager', {
      body: JSON.stringify({
        method: 'broadcast-permissions-update',
        userId
      })
    });

    if (error) {
      console.error('Error broadcasting permissions update:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error in broadcastPermissionsUpdate:', err);
    return false;
  }
}
