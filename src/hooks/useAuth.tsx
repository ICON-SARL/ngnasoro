
import { useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert string role to UserRole enum
const stringToUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role) return null;
  
  const normalizedRole = role.toLowerCase();
  console.log('useAuth: Converting role:', { original: role, normalized: normalizedRole });
  
  switch(normalizedRole) {
    case 'admin':
      return UserRole.Admin;
    case 'sfd_admin':
      return UserRole.SfdAdmin;
    case 'client':
      return UserRole.Client;
    case 'user':
      return UserRole.Client; // Map 'user' to 'Client' for mobile compatibility
    default:
      console.log(`useAuth: Unknown role type: ${role}, defaulting to Client`);
      return UserRole.Client; // Default to Client
  }
};

// Export the hook directly
const useAuth = () => {
  const authContext = useAuthOriginal();
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);

  useEffect(() => {
    const determineUserRole = async () => {
      const { user } = authContext;
      
      console.log('useAuth: Determining user role for:', { 
        user: !!user, 
        userId: user?.id,
        metadata: user?.app_metadata 
      });

      if (user) {
        try {
          // Use ONLY the database as source of truth for roles
          console.log('useAuth: Checking roles from database...');
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          if (error) {
            console.error('useAuth: Error fetching user roles:', error);
            // Default to Client if error
            setUserRole(UserRole.Client);
            setIsClient(true);
            setIsCheckingRole(false);
            return;
          }
          
          console.log('useAuth: Found user roles in database:', userRoles);
          
          // Check for the most privileged roles first
          if (userRoles.some(r => r.role === 'admin')) {
            console.log('useAuth: Setting admin role');
            setUserRole(UserRole.Admin);
            setIsAdmin(true);
            setIsSfdAdmin(false);
            setIsClient(false);
            sessionStorage.setItem('user_role', 'admin');
          } else if (userRoles.some(r => r.role === 'sfd_admin')) {
            console.log('useAuth: Setting sfd_admin role');
            setUserRole(UserRole.SfdAdmin);
            setIsAdmin(false);
            setIsSfdAdmin(true);
            setIsClient(false);
            sessionStorage.setItem('user_role', 'sfd_admin');
          } else if (userRoles.some(r => ['client', 'user'].includes(r.role))) {
            console.log('useAuth: Setting client role');
            setUserRole(UserRole.Client);
            setIsAdmin(false);
            setIsSfdAdmin(false);
            setIsClient(true);
            sessionStorage.setItem('user_role', 'client');
          } else {
            // Default to Client if no specific role found
            console.log('useAuth: No specific role found, defaulting to Client');
            setUserRole(UserRole.Client);
            setIsAdmin(false);
            setIsSfdAdmin(false);
            setIsClient(true);
            sessionStorage.setItem('user_role', 'client');
          }
        } catch (error) {
          console.error('useAuth: Error determining user role:', error);
          setUserRole(UserRole.Client); // Default fallback
          setIsClient(true);
        }
      } else {
        // No user, clear roles
        console.log('useAuth: No user found, clearing roles');
        setUserRole(null);
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setIsClient(false);
        sessionStorage.removeItem('user_role');
      }
      
      setIsCheckingRole(false);
    };

    determineUserRole();
  }, [authContext.user]);

  return {
    ...authContext,
    userRole,
    isAdmin,
    isSfdAdmin,
    isClient,
    isCheckingRole
  };
};

// Export the enhanced hook and types
export { useAuth };
export type { User, AuthContextProps };
export { UserRole };
