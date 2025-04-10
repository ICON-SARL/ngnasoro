
export enum UserRole {
  CLIENT = 'client',
  SFD_ADMIN = 'sfd_admin',
  SUPER_ADMIN = 'super_admin',
  UNKNOWN = 'unknown'
}

export interface UserMetadata {
  full_name?: string;
  phone?: string;
  role?: UserRole;
  sfd_id?: string;
}

export interface UserSession {
  id: string;
  email: string;
  user_metadata: UserMetadata;
  app_metadata: {
    role?: string;
  };
}

export type AuthContextType = {
  user: UserSession | null;
  userRole: UserRole;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithOAuth: (provider: string) => Promise<void>;
  signUp: (email: string, password: string, metadata: UserMetadata) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateUserData: (data: Partial<UserMetadata>) => Promise<void>;
  checkAuth: () => Promise<UserSession | null>;
  sendMagicLink: (email: string) => Promise<void>;
  switchActiveSfd: (sfdId: string) => Promise<void>;
};
