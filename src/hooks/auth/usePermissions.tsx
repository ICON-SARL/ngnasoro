
import { useAuth } from '@/hooks/auth';
import { useEffect, useState } from 'react';
import { UserRole, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } from '@/utils/auth/roles';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function usePermissions() {
  const { user, session } = useAuth();
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
        // Get roles from auth metadata first (faster)
        const metadataRole = user.app_metadata?.role;
        
        let roles: UserRole[] = [];
        
        if (metadataRole) {
          // Convert string role to UserRole enum
          if (metadataRole === 'admin') roles.push(UserRole.SUPER_ADMIN);
          else if (metadataRole === 'sfd_admin') roles.push(UserRole.SFD_ADMIN);
          else if (metadataRole === 'client') roles.push(UserRole.CLIENT);
          else roles.push(UserRole.USER);
        } else {
          // Fallback to database roles
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error) {
            console.error('Error fetching user roles:', error);
            toast({
              title: "Erreur de rôles",
              description: "Impossible de charger vos permissions. Veuillez réessayer.",
              variant: "destructive"
            });
            setLoading(false);
            return;
          }

          // Map string roles to UserRole enum
          roles = data.map(r => {
            const role = r.role.toLowerCase();
            if (role === 'admin') return UserRole.SUPER_ADMIN;
            if (role === 'sfd_admin') return UserRole.SFD_ADMIN;
            if (role === 'client' || role === 'user') return UserRole.CLIENT;
            return UserRole.USER;
          });
        }
        
        // Default to USER role if no roles assigned
        if (roles.length === 0) {
          roles = [UserRole.USER];
        }
        
        setUserRoles(roles);
        
        // Combine permissions from all roles
        const combinedPermissions = roles.reduce((acc, role) => {
          return [...acc, ...(DEFAULT_ROLE_PERMISSIONS[role] || [])];
        }, [] as string[]);
        
        // Remove duplicates
        const uniquePermissions = [...new Set(combinedPermissions)];
        setUserPermissions(uniquePermissions);
        
        console.log('User roles loaded:', roles);
        console.log('User permissions:', uniquePermissions);
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
    
    // Setup listener for auth changes to refresh roles
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      if (user) fetchUserRoles();
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
    
  }, [user, toast]);

  return {
    userRoles,
    userPermissions,
    hasRole: (role: UserRole) => userRoles.includes(role),
    hasPermission: (permission: string) => userPermissions.includes(permission),
    isAdmin: () => userRoles.includes(UserRole.SUPER_ADMIN),
    isSfdAdmin: () => userRoles.includes(UserRole.SFD_ADMIN),
    isClient: () => userRoles.includes(UserRole.CLIENT),
    loading
  };
}
