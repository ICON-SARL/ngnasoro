
// Re-export from the new location to maintain backward compatibility
import { AuthProvider, useAuth } from './auth/index';
import { User, AuthContextProps, Role, UserRole } from './auth/types';

// Re-export everything
export { useAuth, AuthProvider, UserRole };
export type { User, AuthContextProps, Role };
