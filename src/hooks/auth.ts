
// Re-export from the new location to maintain backward compatibility
import { useAuth as useAuthOriginal, AuthProvider, ExtendedUser } from './useAuth';
import { UserRole } from '@/utils/auth/roleTypes';

// Re-export the hook with the same name
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export types to maintain backward compatibility
export type { User } from '@supabase/supabase-js';
export { UserRole } from '@/utils/auth/roleTypes';
export type { ExtendedUser };

export interface AuthContextProps {
  user: ExtendedUser | null;
  userRole: UserRole | null;
  isSfdAdmin: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signOut: () => Promise<void>;
  loading?: boolean;
  session?: any;
  signIn?: (email: string, password: string) => Promise<any>;
  signUp?: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => Promise<void>;
  refreshSession?: () => Promise<void>;
}

export type Role = UserRole;
