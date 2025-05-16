
import { useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert string role to UserRole enum
const stringToUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role) return null;
  
  // Make sure we convert to lowercase for consistent comparison
  const normalizedRole = role.toLowerCase();
  
  switch(normalizedRole) {
    case 'admin':
      return UserRole.Admin;
    case 'sfd_admin':
      return UserRole.SfdAdmin;
    case 'client':
      return UserRole.Client;
    case 'user':
      return UserRole.User;
    default:
      return null;
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

  // Function to check role in database
  const checkRoleInDatabase = async (userId: string, role: UserRole | string): Promise<boolean> => {
    try {
      // Safely convert role to string
      const roleString = String(role).toLowerCase();
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', roleString as any); // Use type assertion to bypass strict type checking
      
      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }
      
      return !!data && data.length > 0; // Return true if data exists
    } catch (err) {
      console.error('Error in checkRoleInDatabase:', err);
      return false;
    }
  };

  useEffect(() => {
    const determineUserRole = async () => {
      const { user } = authContext;
      
      if (user) {
        // Check role from multiple sources in order of reliability
        
        // 1. First check from session storage for persistence
        const storedRole = sessionStorage.getItem('user_role');
        if (storedRole) {
          const roleEnum = stringToUserRole(storedRole);
          if (roleEnum !== null) {
            setUserRole(roleEnum);
          }
          
          setIsAdmin(storedRole === 'admin');
          setIsSfdAdmin(storedRole === 'sfd_admin');
          setIsClient(storedRole === 'client');
          setIsCheckingRole(false);
          return;
        }
        
        // 2. Check from user metadata
        const metadataRole = user.app_metadata?.role;
        if (metadataRole) {
          const roleEnum = stringToUserRole(metadataRole);
          if (roleEnum !== null) {
            setUserRole(roleEnum);
          }
          
          setIsAdmin(metadataRole === 'admin');
          setIsSfdAdmin(metadataRole === 'sfd_admin');
          setIsClient(metadataRole === 'client');
          // Store for future use
          sessionStorage.setItem('user_role', metadataRole);
          setIsCheckingRole(false);
          return;
        }
        
        // 3. Check from database
        try {
          // Check for the most privileged roles first
          const isUserAdmin = await checkRoleInDatabase(user.id, 'admin');
          if (isUserAdmin) {
            setUserRole(UserRole.Admin);
            setIsAdmin(true);
            sessionStorage.setItem('user_role', 'admin');
            setIsCheckingRole(false);
            return;
          }
          
          const isUserSfdAdmin = await checkRoleInDatabase(user.id, 'sfd_admin');
          if (isUserSfdAdmin) {
            setUserRole(UserRole.SfdAdmin);
            setIsSfdAdmin(true);
            sessionStorage.setItem('user_role', 'sfd_admin');
            setIsCheckingRole(false);
            return;
          }
          
          const isUserClient = await checkRoleInDatabase(user.id, 'client');
          if (isUserClient) {
            setUserRole(UserRole.Client);
            setIsClient(true);
            sessionStorage.setItem('user_role', 'client');
            setIsCheckingRole(false);
            return;
          }
          
          // Default to 'user' if no specific role found
          setUserRole(UserRole.User);
          sessionStorage.setItem('user_role', 'user');
        } catch (error) {
          console.error('Error determining user role:', error);
          setUserRole(UserRole.User); // Default fallback
        }
      } else {
        // No user, clear roles
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
