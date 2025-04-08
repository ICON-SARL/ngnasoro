
import { AuthProvider, useAuth as useAuthOriginal } from './auth/AuthContext';

// Re-export the hook and the provider from AuthContext
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export the types to maintain compatibility
export type { User, AuthContextProps, Role } from './auth/types';
// Only export UserRole once, as a value export rather than a type export
export { UserRole } from './auth/types';
