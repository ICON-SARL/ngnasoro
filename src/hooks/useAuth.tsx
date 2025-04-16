
import { useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  const isAdmin = auth.user?.app_metadata?.role === 'admin';
  const isSfdAdmin = auth.user?.app_metadata?.role === 'sfd_admin';
  const isClient = auth.user?.app_metadata?.role === 'client';
  
  return {
    ...auth,
    isAdmin,
    isSfdAdmin,
    isClient,
    userRole: auth.user?.app_metadata?.role || 'user'
  };
};

export type { User, AuthContextProps };
export { UserRole };
