
// Import from the correct location
import { AuthProvider, useAuth as useAuthOriginal } from './auth/AuthContext';

// Re-export the hook and the provider
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export the types
export type { User, AuthContextProps, Role } from './auth/types';
export { UserRole } from './auth/types';
