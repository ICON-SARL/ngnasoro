
// Re-export from the new location to maintain backward compatibility
import { useAuth as useAuthOriginal, AuthProvider } from './useAuth';

// Re-export the hook with the same name
export const useAuth = useAuthOriginal;
export { AuthProvider };

// Re-export types to maintain backward compatibility
export type { User } from '@supabase/supabase-js';
export { UserRole } from '@/utils/auth/roleTypes';

export interface AuthContextProps {
  user: User | null;
  userRole: UserRole | null;
  isSfdAdmin: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signOut: () => Promise<void>;
}

export type Role = UserRole;
