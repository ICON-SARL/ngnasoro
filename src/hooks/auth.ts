
// Re-export from the new location to maintain backward compatibility
import { AuthProvider, useAuth, UserRole } from './auth/index';
import type { User, AuthContextProps, Role } from './auth/types';

// Re-export everything
export { useAuth, AuthProvider, UserRole };
export type { User, AuthContextProps, Role };
