
// Re-export from the new location to maintain backward compatibility
import { useAuth as useAuthOriginal, AuthProvider } from './auth/AuthContext';

// Re-export the hook with the same name
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export types to maintain backward compatibility
export type { User, AuthContextProps, Role } from './hooks/auth/types';
export { UserRole } from './hooks/auth/types';
