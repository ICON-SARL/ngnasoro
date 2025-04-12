
import { AuthProvider, useAuth as useAuthOriginal } from './auth/AuthContext';
import { User, AuthContextProps, Role, UserRole } from './auth/types';

// Re-export the hook and the provider from AuthContext
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export the types to maintain compatibility
export type { User, AuthContextProps, Role };
export { UserRole };
