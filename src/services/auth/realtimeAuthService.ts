
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook to subscribe to real-time permission changes
 */
export function useRealtimePermissions(
  userId: string | null,
  onPermissionsChange: () => void
): void {
  useEffect(() => {
    if (!userId) return;

    // Subscribe to user_roles changes
    const userRolesSubscription = supabase
      .channel('user_roles_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${userId}`
        },
        () => {
          console.log('User roles changed, refreshing permissions');
          onPermissionsChange();
        }
      )
      .subscribe();

    return () => {
      userRolesSubscription.unsubscribe();
    };
  }, [userId, onPermissionsChange]);
}
