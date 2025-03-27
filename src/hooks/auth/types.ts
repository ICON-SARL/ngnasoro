
import { Session } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    sfd_id?: string;
    phone?: string;
    biometric_enabled?: boolean;
    [key: string]: any;
  };
  phone?: string;
  app_metadata: {
    role?: string;
    [key: string]: any;
  };
  aud: string;
  created_at: string;
}

export interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string, useOtp?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
  loading: boolean; // Alias for isLoading for backward compatibility
  activeSfdId: string | null;
  setActiveSfdId: (id: string) => void;
  isAdmin: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  verifyBiometricAuth: () => Promise<boolean>;
  biometricEnabled: boolean;
  toggleBiometricAuth: (enabled: boolean) => Promise<void>;
}
