
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
      console.log(`Unknown role type: ${role}`);
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
  const checkRoleInDatabase = async (userId: string, role: string): Promise<boolean> => {
    try {
      console.log(`Checking database for role: '${role}' for user ${userId}`);
      
      // Convert role to string and lowercase for consistency
      const roleString = role.toLowerCase();
      
      // Use a direct query approach
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error checking user role:', error);
        return false;
      }
      
      console.log('Database roles found:', data);
      
      // Check if any of the returned roles match the required role
      return data.some(r => r.role.toLowerCase() === roleString);
    } catch (err) {
      console.error('Error in checkRoleInDatabase:', err);
      return false;
    }
  };

  useEffect(() => {
    const determineUserRole = async () => {
      const { user } = authContext;
      
      if (user) {
        console.log('Determining user role for:', user);

        // Check role from multiple sources in order of reliability
        
        // 1. First check from session storage for persistence
        const storedRole = sessionStorage.getItem('user_role');
        if (storedRole) {
          console.log('Found role in session storage:', storedRole);
          const roleEnum = stringToUserRole(storedRole);
          if (roleEnum !== null) {
            setUserRole(roleEnum);
          }
          
          setIsAdmin(storedRole.toLowerCase() === 'admin');
          setIsSfdAdmin(storedRole.toLowerCase() === 'sfd_admin');
          setIsClient(storedRole.toLowerCase() === 'client');
          setIsCheckingRole(false);
          return;
        }
        
        // 2. Check from user metadata
        const metadataRole = user.app_metadata?.role;
        if (metadataRole) {
          console.log('Found role in metadata:', metadataRole);
          const roleEnum = stringToUserRole(metadataRole);
          if (roleEnum !== null) {
            setUserRole(roleEnum);
          }
          
          setIsAdmin(metadataRole.toLowerCase() === 'admin');
          setIsSfdAdmin(metadataRole.toLowerCase() === 'sfd_admin');
          setIsClient(metadataRole.toLowerCase() === 'client');
          // Store for future use
          sessionStorage.setItem('user_role', metadataRole);
          setIsCheckingRole(false);
          return;
        }
        
        // 3. Check from database
        try {
          console.log('Checking roles from database...');
          // Get all roles for the user
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          if (error) {
            console.error('Error fetching user roles:', error);
            setIsCheckingRole(false);
            return;
          }
          
          console.log('Found user roles in database:', userRoles);
          
          // Check for the most privileged roles first
          if (userRoles.some(r => r.role.toLowerCase() === 'admin')) {
            setUserRole(UserRole.Admin);
            setIsAdmin(true);
            sessionStorage.setItem('user_role', 'admin');
            setIsCheckingRole(false);
            return;
          }
          
          if (userRoles.some(r => r.role.toLowerCase() === 'sfd_admin')) {
            setUserRole(UserRole.SfdAdmin);
            setIsSfdAdmin(true);
            sessionStorage.setItem('user_role', 'sfd_admin');
            setIsCheckingRole(false);
            return;
          }
          
          if (userRoles.some(r => r.role.toLowerCase() === 'client')) {
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
        console.log('No user found, clearing roles');
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
