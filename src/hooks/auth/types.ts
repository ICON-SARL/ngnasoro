
export type Role = 'admin' | 'sfd_admin' | 'user' | 'client' | null;

export enum UserRole {
  ADMIN = 'admin',
  SUPER_ADMIN = 'admin',
  SFD_ADMIN = 'sfd_admin',
  CLIENT = 'client',
  USER = 'user'
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  user_metadata: Record<string, any>;
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
  signIn: (email: string, password: string) => Promise<{ success?: boolean; error?: any; data?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<{ success?: boolean; error?: any }>;
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
