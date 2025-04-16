
// Re-export from the new location to maintain backward compatibility
import { useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, UserRole } from './auth/types';

// Export the hook directly
export const useAuth = useAuthOriginal;

// Re-export types to maintain backward compatibility
export type { User, AuthContextProps };
export { UserRole };
