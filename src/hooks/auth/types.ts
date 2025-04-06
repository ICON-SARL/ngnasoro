
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export enum Role {
  SUPER_ADMIN = 'admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  USER = 'user'
}

// Export Role as UserRole for backward compatibility
export { Role as UserRole };

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
  user_metadata: Record<string, any>;
  app_metadata: {
    role?: string;
    role_assigned?: boolean;
    roles?: string[];
  };
}

export interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  session: Session | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}
