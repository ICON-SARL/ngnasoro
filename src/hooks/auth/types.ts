
export type Role = 'admin' | 'sfd_admin' | 'user' | null;

export interface AppMetadata {
  role: Role;
  role_assigned?: boolean;
  roles?: string[];
  sfd_id?: string;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  sfd_id?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: AppMetadata;
}

export interface SignOutResult {
  success: boolean;
  error?: string;
}

export interface SignUpData {
  email: string;
  password: string;
  metadata?: Record<string, any>;
}

export interface AuthContextProps {
  user: User | null;
  session: any | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  signOut: () => Promise<SignOutResult>;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  setUser: (user: User | null) => void;
  signUp: (data: SignUpData) => Promise<void>;
  isLoggedIn: boolean;
  userRole: Role;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  isLoading: boolean;
  refreshSession: () => Promise<void>;
}
