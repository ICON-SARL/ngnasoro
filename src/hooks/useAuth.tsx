
import { useAuth as useAuthFromContext } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

// Re-export the hook with the same interface along with types
export function useAuth() {
  const auth = useAuthFromContext();
  
  // Add convenience methods
  return {
    ...auth,
    isAdmin: auth.user?.app_metadata?.role === 'admin' || auth.user?.app_metadata?.role === UserRole.SuperAdmin,
    isSfdAdmin: auth.user?.app_metadata?.role === 'sfd_admin' || auth.user?.app_metadata?.role === UserRole.SfdAdmin,
    isClient: auth.user?.app_metadata?.role === 'user' || auth.user?.app_metadata?.role === 'client' || auth.user?.app_metadata?.role === UserRole.Client,
    userRole: auth.user?.app_metadata?.role || 'user'
  };
}

// Re-export the types
export type { User, AuthContextProps };
export { UserRole };
