
// Re-export from the new location to maintain backward compatibility
import { useAuth as useAuthOriginal, AuthProvider } from './auth/AuthContext';
import { User, AuthContextProps, Role, UserRole } from './auth/types';

// Re-export the hook and provider
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export types to maintain backward compatibility
export type { User, AuthContextProps, Role };
export { UserRole };
