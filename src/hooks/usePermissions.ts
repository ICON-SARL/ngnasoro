
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/utils/auth/roleTypes';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePermissions() {
  const { user } = useAuth();
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userPermissions, setUserPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
          toast({
            title: "Erreur de rôles",
            description: "Impossible de charger vos permissions.",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        // Map data to roles
        const roles = data.map(role => role.role as UserRole);
        
        // Default to USER role if no roles assigned
        if (roles.length === 0 && user.app_metadata?.role) {
          const appRole = user.app_metadata.role as UserRole;
          setUserRoles([appRole]);
        } else if (roles.length === 0) {
          setUserRoles([UserRole.USER]);
        } else {
          setUserRoles(roles);
        }
        
        console.log('User roles loaded:', userRoles);
        
      } catch (err) {
        console.error('Error in usePermissions:', err);
        toast({
          title: "Erreur système",
          description: "Une erreur est survenue lors du chargement de vos permissions.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user, toast]);

  return {
    userRoles,
    userPermissions,
    hasRole: (role: UserRole) => userRoles.includes(role),
    hasPermission: (permission: string) => userPermissions.includes(permission),
    isAdmin: () => userRoles.includes(UserRole.SUPER_ADMIN) || userRoles.includes(UserRole.ADMIN),
    isSfdAdmin: () => userRoles.includes(UserRole.SFD_ADMIN),
    isClient: () => userRoles.includes(UserRole.CLIENT),
    loading
  };
}
