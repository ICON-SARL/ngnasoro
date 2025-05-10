
import { Session } from '@supabase/supabase-js';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
  SuperAdmin = 'super_admin',
  SfdAdmin = 'sfd_admin',
  Client = 'client'
}

export interface User {
  id: string;
  app_metadata?: {
    role?: string;
    [key: string]: any;
  };
  user_metadata?: {
    [key: string]: any;
  };
  email?: string;
  phone?: string;
  aud?: string;
  created_at?: string;
  [key: string]: any;
}

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: string;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signUp: (email: string, password: string, metadata?: any) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<{ error?: any }>;
  refreshSession: () => Promise<void>;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}
