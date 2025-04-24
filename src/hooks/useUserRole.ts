
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUserRole() {
  const { user } = useAuth();
  const [roles, setRoles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserRoles = async () => {
      if (!user) {
        setRoles([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);

        // Fetch roles from user_roles table
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (rolesError) throw rolesError;

        // Transform roles data
        const rolesList = userRoles?.map(r => r.role) || [];
        
        // Add default user role if no roles found
        if (rolesList.length === 0) {
          rolesList.push('user');
        }

        setRoles(Array.from(new Set(rolesList))); // Remove duplicates
        
      } catch (err) {
        console.error('Error fetching user roles:', err);
        setError(err as Error);
        // Set default user role on error
        setRoles(['user']);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  return {
    roles,
    isLoading,
    error,
    isAdmin: () => roles.includes('admin'),
    isSfdAdmin: () => roles.includes('sfd_admin'),
    isClient: () => roles.includes('client'),
  };
}
