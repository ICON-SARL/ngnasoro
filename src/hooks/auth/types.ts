
import { User as SupabaseUser, Session } from '@supabase/supabase-js';

export type User = SupabaseUser;

export enum UserRole {
  Admin = 'admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client'
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | null;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  isCheckingRole?: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string) => void;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<any>;
  refreshSession: () => Promise<void>;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}
