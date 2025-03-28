
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * Hook for redirecting users based on their role
 */
export const useRoleRedirect = () => {
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    
    if (user && userRole) {
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
          // Default fallback for unknown roles
          navigate('/mobile-flow');
      }
    }
  }, [user, userRole, loading, navigate]);

  return null;
};
