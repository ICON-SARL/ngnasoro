
import { useAuth as useAuthFromContext } from './auth/AuthContext';

// Re-export the hook with the same interface
export function useAuth() {
  return useAuthFromContext();
}
