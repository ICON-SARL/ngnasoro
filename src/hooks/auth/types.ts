
export type Role = 'admin' | 'sfd_admin' | 'user' | 'client' | null;

export enum UserRole {
  SUPER_ADMIN = 'admin',
  ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string | null;
  user_metadata: {
    [key: string]: any;
    sfd_id?: string;
  };
  app_metadata: {
    role?: Role;
    role_assigned?: boolean;
    roles?: string[];
    sfd_id?: string;
  };
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
  userRole: Role;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  session: any | null;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}

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
