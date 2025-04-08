
// Simple re-export from the auth module
import { useAuth, AuthProvider } from './auth/index';
import { User, AuthContextProps, Role } from './auth/types';
import { UserRole } from './auth/types';

export { useAuth, AuthProvider, UserRole };
export type { User, AuthContextProps, Role };
