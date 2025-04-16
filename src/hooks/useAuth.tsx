
import { useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

export const useAuth = () => {
  const auth = useAuthOriginal();
  
  const isAdmin = auth.user?.app_metadata?.role === UserRole.ADMIN;
  const isSfdAdmin = auth.user?.app_metadata?.role === UserRole.SFD_ADMIN;
  const isClient = auth.user?.app_metadata?.role === UserRole.CLIENT;
  
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
