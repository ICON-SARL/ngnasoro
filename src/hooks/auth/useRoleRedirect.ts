
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to handle automatic redirects based on user roles
 * Redirects users to appropriate dashboards based on their role
 */
export const useRoleRedirect = (authMode?: 'default' | 'admin' | 'sfd') => {
  const { user, session, userRole, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoading) {
      return; // Wait until auth is loaded
    }

    // If user is logged in, redirect based on role
    if (user && session) {
      // Skip redirect if user is already on an appropriate page
      const currentPath = location.pathname;
      
      // Only redirect if user is on auth page or root
      if (currentPath === '/auth' || currentPath === '/login' || currentPath === '/') {
        // If we're in admin mode, only redirect to admin page if user is admin
        if (authMode === 'admin' && userRole !== 'admin') {
          // User doesn't have admin role but trying to access admin
          console.log('Access denied: User is not admin but tried to access admin interface');
          return;
        }
        
        // If we're in sfd mode, only redirect to sfd page if user is sfd_admin
        if (authMode === 'sfd' && userRole !== 'sfd_admin') {
          // User doesn't have sfd_admin role but trying to access sfd admin
          console.log('Access denied: User is not SFD admin but tried to access SFD admin interface');
          return;
        }
        
        switch (userRole) {
          case 'admin':
            navigate('/super-admin-dashboard');
            break;
          case 'sfd_admin':
            navigate('/agency-dashboard');
            break;
          case 'user':
            navigate('/mobile-flow');
            break;
          default:
            // No redirect for other paths
            break;
        }
      }
    }
  }, [user, session, userRole, isLoading, navigate, location.pathname, authMode]);

  return { isLoading };
};
