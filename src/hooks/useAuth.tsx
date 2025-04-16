
import { useAuth as useAuthFromContext } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

export function useAuth() {
  const auth = useAuthFromContext();
  
  // We're using the existing methods from the auth context 
  // instead of recomputing them, since they already have the same logic.
  return {
    ...auth
  };
}

// Re-exporter les types
export type { User, AuthContextProps };
export { UserRole };
