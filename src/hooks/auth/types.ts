
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { UserRole } from '@/utils/auth/roleTypes';

export { UserRole } from '@/utils/auth/roleTypes';

export interface User extends Omit<SupabaseUser, 'app_metadata' | 'user_metadata'> {
  app_metadata: {
    provider?: string;
    providers?: string[];
    role?: UserRole;
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  sfd_id?: string;
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error?: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp?: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<{ error: any }>;
  userRole?: UserRole | null;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => Promise<void>;
  isLoggedIn?: boolean;
  isAdmin?: boolean;
  isSfdAdmin?: boolean;
  activeSfdId?: string | null;
  setActiveSfdId?: (sfdId: string | null) => void;
  refreshSession: () => Promise<void>;
}

export type Role = UserRole;

// Adding these types to fix the missing exports
export interface AssociateSfdParams {
  userId: string;
  sfdId: string;
  makeDefault?: boolean;
}

export interface AssociateSfdResult {
  success: boolean;
  error?: string;
  userSfd?: any;
}
