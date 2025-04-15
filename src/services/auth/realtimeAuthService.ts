
import { supabase } from '@/integrations/supabase/client';
import { PERMISSIONS } from '@/utils/auth/roleTypes';
import { useEffect } from 'react';

/**
 * Service for handling real-time authorization changes
 */
export const realtimeAuthService = {
  /**
   * Force invalidate all sessions for a user
   */
  async invalidateUserSessions(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('auth-manager', {
        body: { method: 'invalidate-sessions', userId }
      });
      
      if (error || !data?.success) {
        console.error('Error invalidating sessions:', error || data?.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error in invalidateUserSessions:', error);
      return false;
    }
  },
  
  /**
   * Update a user's role with real-time permission propagation
   */
  async updateUserRole(userId: string, role: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.functions.invoke('auth-manager', {
        body: { method: 'update-role', userId, role }
      });
      
      if (error || !data?.success) {
        console.error('Error updating user role:', error || data?.error);
        return false;
      }
      
      // Broadcast the change to all clients
      await supabase.functions.invoke('auth-manager', {
        body: { method: 'broadcast-permissions-update', userId }
      });
      
      return true;
    } catch (error) {
      console.error('Error in updateUserRole:', error);
      return false;
    }
  },
  
  /**
   * Subscribe to permission changes for the current user
   */
  subscribeToPermissionChanges(userId: string, callback: () => void) {
    return supabase
      .channel(`auth-permissions-${userId}`)
      .on(
        'broadcast',
        { event: 'permissions_update' },
        (payload) => {
          if (payload.user_id === userId) {
            callback();
          }
        }
      )
      .subscribe();
  }
};

/**
 * Hook to listen for real-time permission changes
 */
export function useRealtimePermissions(userId: string | null, onPermissionsChanged: () => void) {
  useEffect(() => {
    if (!userId) return;
    
    // Subscribe to permission changes
    const subscription = realtimeAuthService.subscribeToPermissionChanges(
      userId,
      onPermissionsChanged
    );
    
    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId, onPermissionsChanged]);
}
