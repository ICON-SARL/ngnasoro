
// Simple re-export from the auth module
import { useAuth, AuthProvider, UserRole } from './auth/index';
import type { User, AuthContextProps, Role } from './auth/types';

export { useAuth, AuthProvider, UserRole };
export type { User, AuthContextProps, Role };
