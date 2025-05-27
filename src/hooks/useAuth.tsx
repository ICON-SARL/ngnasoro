
import { useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Helper function to convert string role to UserRole enum with better mapping
const stringToUserRole = (role: string | null | undefined): UserRole | null => {
  if (!role) return null;
  
  // Make sure we convert to lowercase for consistent comparison
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
      // Map 'user' to 'Client' for mobile app compatibility
      console.log('useAuth: Mapping user role to Client for mobile compatibility');
      return UserRole.Client;
    default:
      console.log(`useAuth: Unknown role type: ${role}, defaulting to Client for mobile compatibility`);
      return UserRole.Client; // Default to Client for mobile users
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
      console.log(`useAuth: Checking database for role: '${role}' for user ${userId}`);
      
      const roleString = role.toLowerCase();
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('useAuth: Error checking user role:', error);
        return false;
      }
      
      console.log('useAuth: Database roles found:', data);
      
      // Check if any of the returned roles match OR if user has 'user' role and we're looking for 'client'
      const hasExactRole = data.some(r => r.role.toLowerCase() === roleString);
      const hasUserRoleForClient = roleString === 'client' && data.some(r => r.role.toLowerCase() === 'user');
      
      return hasExactRole || hasUserRoleForClient;
    } catch (err) {
      console.error('useAuth: Error in checkRoleInDatabase:', err);
      return false;
    }
  };

  useEffect(() => {
    const determineUserRole = async () => {
      const { user } = authContext;
      
      console.log('useAuth: Determining user role for:', { 
        user: !!user, 
        userId: user?.id,
        metadata: user?.app_metadata 
      });

      if (user) {
        // Check role from multiple sources in order of reliability
        
        // 1. First check from session storage for persistence
        const storedRole = sessionStorage.getItem('user_role');
        if (storedRole) {
          console.log('useAuth: Found role in session storage:', storedRole);
          const roleEnum = stringToUserRole(storedRole);
          if (roleEnum !== null) {
            setUserRole(roleEnum);
          }
          
          const isAdminUser = storedRole.toLowerCase() === 'admin';
          const isSfdAdminUser = storedRole.toLowerCase() === 'sfd_admin';
          const isClientUser = storedRole.toLowerCase() === 'client' || storedRole.toLowerCase() === 'user';
          
          setIsAdmin(isAdminUser);
          setIsSfdAdmin(isSfdAdminUser);
          setIsClient(isClientUser);
          setIsCheckingRole(false);
          return;
        }
        
        // 2. Check from user metadata
        const metadataRole = user.app_metadata?.role;
        if (metadataRole) {
          console.log('useAuth: Found role in metadata:', metadataRole);
          const roleEnum = stringToUserRole(metadataRole);
          if (roleEnum !== null) {
            setUserRole(roleEnum);
          }
          
          const isAdminUser = metadataRole.toLowerCase() === 'admin';
          const isSfdAdminUser = metadataRole.toLowerCase() === 'sfd_admin';
          const isClientUser = metadataRole.toLowerCase() === 'client' || metadataRole.toLowerCase() === 'user';
          
          setIsAdmin(isAdminUser);
          setIsSfdAdmin(isSfdAdminUser);
          setIsClient(isClientUser);
          
          // Store for future use, mapping 'user' to 'client'
          const roleToStore = metadataRole.toLowerCase() === 'user' ? 'client' : metadataRole;
          sessionStorage.setItem('user_role', roleToStore);
          setIsCheckingRole(false);
          return;
        }
        
        // 3. Check from database
        try {
          console.log('useAuth: Checking roles from database...');
          const { data: userRoles, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);
            
          if (error) {
            console.error('useAuth: Error fetching user roles:', error);
            setIsCheckingRole(false);
            return;
          }
          
          console.log('useAuth: Found user roles in database:', userRoles);
          
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
          
          // If user has 'user' role, map it to client for mobile compatibility
          if (userRoles.some(r => r.role.toLowerCase() === 'user')) {
            console.log('useAuth: Mapping database user role to client');
            setUserRole(UserRole.Client);
            setIsClient(true);
            sessionStorage.setItem('user_role', 'client');
            setIsCheckingRole(false);
            return;
          }
          
          // Default to Client if no specific role found (for mobile compatibility)
          console.log('useAuth: No specific role found, defaulting to Client');
          setUserRole(UserRole.Client);
          setIsClient(true);
          sessionStorage.setItem('user_role', 'client');
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
