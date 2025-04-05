
export interface User {
  id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  role?: string;
  sfd_id?: string;
  phone?: string;
  aud?: string;
  created_at?: string;
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;
}

export enum Role {
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export interface AuthContextProps {
  user: User | null;
  setUser: (user: User | null) => void;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  session: any | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}
