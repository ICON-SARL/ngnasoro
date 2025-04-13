
import { Session, User as SupabaseUser } from '@supabase/supabase-js';

export enum UserRole {
  User = 'client',
  SfdAdmin = 'sfd_admin',
  SuperAdmin = 'admin'
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface User extends SupabaseUser {
  // Additional properties specific to your application
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ error: any; data?: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  userRole: UserRole;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}
