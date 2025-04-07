
// Re-export from the new location to maintain backward compatibility
import { useAuth as useAuthOriginal } from './auth/AuthContext';

// Re-export the hook with the same name
export const useAuth = useAuthOriginal;

// Re-export types to maintain backward compatibility
export { User, AuthContextProps, Role } from './auth/types';
