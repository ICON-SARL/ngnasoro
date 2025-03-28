
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook to handle automatic redirects based on user roles
 * Redirects users to appropriate dashboards based on their role
 */
export const useRoleRedirect = () => {
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
      
      // If user is on auth page or root, redirect based on role
      if (currentPath === '/auth' || currentPath === '/login' || currentPath === '/') {
        switch (userRole) {
          case 'admin':
            navigate('/super-admin-dashboard');
            break;
          case 'sfd_admin':
            navigate('/agency-dashboard');
            break;
          default: // Regular user
            navigate('/mobile-flow');
            break;
        }
      }
    }
  }, [user, session, userRole, isLoading, navigate, location.pathname]);

  return { isLoading };
};
