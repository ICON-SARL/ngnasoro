
import { useAuth } from '@/hooks/auth';
import { useEffect, useState } from 'react';
import { UserRole, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/utils/auth/roleTypes';
import { supabase } from '@/integrations/supabase/client';

export function usePermissions() {
  const { user, session } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setUserRoles([]);
        setUserPermissions([]);
        setLoading(false);
        return;
      }

      try {
        // Get roles from user_roles table
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setLoading(false);
          return;
        }

        const roles = data.map(role => role.role as UserRole);
        
        // Default to USER role if no roles assigned
        if (roles.length === 0) {
          setUserRoles([UserRole.USER]);
          setUserPermissions(DEFAULT_ROLE_PERMISSIONS[UserRole.USER] || []);
        } else {
          setUserRoles(roles);
          
          // Combine permissions from all roles
          const permissions = roles.reduce((allPermissions, role) => {
            return [...allPermissions, ...(DEFAULT_ROLE_PERMISSIONS[role] || [])];
          }, [] as string[]);
          
          // Remove duplicates
          setUserPermissions([...new Set(permissions)]);
        }
      } catch (err) {
        console.error('Error in usePermissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
    
    // Setup listener for auth changes to refresh roles
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      if (user) fetchUserRoles();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
    
  }, [user]);

  return {
    userRoles,
    userPermissions,
    hasRole: (role: UserRole) => userRoles.includes(role),
    hasPermission: (permission: string) => userPermissions.includes(permission),
    isAdmin: () => userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.ADMIN),
    isSfdAdmin: () => userRoles.includes(UserRole.SFD_ADMIN),
    loading
  };
}
