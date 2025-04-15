
import { useAuth as useAuthFromContext } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

// Re-export the hook with the same interface along with types
export function useAuth() {
  return useAuthFromContext();
}

// Re-export the types
export type { User, AuthContextProps };
export { UserRole };
