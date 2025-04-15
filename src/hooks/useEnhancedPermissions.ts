
import { useAuth } from '@/hooks/auth';
import { useEffect, useState, useCallback } from 'react';
import { UserRole } from '@/utils/auth/roleTypes';
import { permissionsService } from '@/services/auth/permissionsService';
import { useRealtimePermissions } from '@/services/auth/realtimeAuthService';
import { useToast } from '@/hooks/use-toast';

/**
 * Enhanced permissions hook with real-time updates
 */
export function useEnhancedPermissions() {
  const { user, session } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Function to refresh permissions
  const refreshPermissions = useCallback(async () => {
    if (!user?.id) {
      setUserRoles([]);
      setUserPermissions([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch all user permissions
      const permissions = await permissionsService.getUserPermissions(user.id);
      setUserPermissions(permissions);
      
      // Get current roles from auth
      const role = user.app_metadata?.role as UserRole;
      setUserRoles(role ? [role] : []);
      
      console.log('Permissions refreshed:', permissions);
    } catch (err) {
      console.error('Error in useEnhancedPermissions:', err);
      toast({
        title: "Erreur système",
        description: "Une erreur est survenue lors du chargement de vos permissions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Initial loading of permissions
  useEffect(() => {
    refreshPermissions();
  }, [refreshPermissions]);
  
  // Subscribe to real-time permission changes
  useRealtimePermissions(user?.id || null, refreshPermissions);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: string) => {
      return userPermissions.includes(permission);
    },
    [userPermissions]
  );
  
  // Check if user has a specific role
  const hasRole = useCallback(
    (role: UserRole) => {
      return userRoles.includes(role);
    },
    [userRoles]
  );

  return {
    userRoles,
    userPermissions,
    hasRole,
    hasPermission,
    isAdmin: () => userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.ADMIN),
    isSfdAdmin: () => userRoles.includes(UserRole.SFD_ADMIN),
    isClient: () => userRoles.includes(UserRole.CLIENT),
    refreshPermissions,
    loading
  };
}
