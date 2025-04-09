
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/utils/auth/roleTypes';
import { useSfdDataAccessCore } from './sfd/useSfdDataAccessCore';

// Extend the base User type to include custom fields
export interface ExtendedUser extends User {
  full_name?: string;
  avatar_url?: string;
  phone?: string;
  sfd_id?: string;
  user_metadata: {
    full_name?: string;
    avatar_url?: string;
    phone?: string;
    sfd_id?: string;
    [key: string]: any;
  };
}

export interface AuthContextType {
  user: ExtendedUser | null;
  userRole: UserRole | null;
  isSfdAdmin: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signOut: () => Promise<void>;
  loading: boolean;
  session: Session | null;
  signIn?: (email: string, password: string) => Promise<any>;
  signUp?: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  biometricEnabled?: boolean; 
  toggleBiometricAuth?: () => Promise<void>;
  refreshSession?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isSfdAdmin: false,
  isAdmin: false,
  isSuperAdmin: false,
  activeSfdId: null,
  setActiveSfdId: () => {},
  signOut: async () => {},
  loading: false,
  session: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<ExtendedUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { 
    activeSfdId, 
    setActiveSfdId,
    sfdData
  } = useSfdDataAccessCore();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    // Get initial session
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setSession(session);
        setUser(session.user as ExtendedUser);
        const role = session.user?.app_metadata?.role;
        setUserRole(role ? role as UserRole : UserRole.USER);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setSession(session);
          setUser(session.user as ExtendedUser);
          const role = session.user?.app_metadata?.role;
          setUserRole(role ? role as UserRole : UserRole.USER);
        } else {
          setUser(null);
          setUserRole(null);
          setSession(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      return await supabase.auth.signInWithPassword({
        email,
        password
      });
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user as ExtendedUser);
      }
      if (error) {
        console.error('Error refreshing session:', error);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Placeholder for biometric auth
  const toggleBiometricAuth = async () => {
    setBiometricEnabled(prev => !prev);
    return Promise.resolve();
  };

  const isSfdAdmin = userRole === UserRole.SFD_ADMIN;
  const isAdmin = userRole === UserRole.ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  const value = {
    user,
    userRole,
    isSfdAdmin,
    isAdmin,
    isSuperAdmin,
    activeSfdId,
    setActiveSfdId,
    signOut,
    loading,
    session,
    signIn,
    signUp,
    biometricEnabled,
    toggleBiometricAuth,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
