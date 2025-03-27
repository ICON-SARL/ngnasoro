
import { useState, useEffect, useContext, createContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
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

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
  loading: true,
  activeSfdId: null,
  setActiveSfdId: () => {},
  isAdmin: false,
  signUp: async () => {},
  verifyBiometricAuth: async () => false,
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

// Updated User interface to match Supabase's User type requirements
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        // Set session first to avoid race conditions
        setSession(session);

        if (session?.user) {
          // Check if user has admin role
          const isAdminUser = session.user.app_metadata?.role === 'admin';
          setIsAdmin(isAdminUser);

          const userBiometricEnabled = 
            session.user.user_metadata.biometric_enabled as boolean || false;
          setBiometricEnabled(userBiometricEnabled);

          setUser({
            id: session.user.id,
            email: session.user.email ?? '',
            full_name: session.user.user_metadata.full_name as string,
            avatar_url: session.user.user_metadata.avatar_url as string,
            sfd_id: session.user.user_metadata.sfd_id as string,
            user_metadata: session.user.user_metadata || {},
            phone: session.user.user_metadata.phone as string,
            app_metadata: session.user.app_metadata || {},
            aud: session.user.aud || '',
            created_at: session.user.created_at || '',
          });

          // Set active SFD ID if available
          if (session.user.user_metadata.sfd_id) {
            setActiveSfdId(session.user.user_metadata.sfd_id as string);
          }
        } else {
          setUser(null);
          setActiveSfdId(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setSession(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      
      if (session?.user) {
        // Check if user has admin role
        const isAdminUser = session.user.app_metadata?.role === 'admin';
        setIsAdmin(isAdminUser);

        const userBiometricEnabled = 
          session.user.user_metadata.biometric_enabled as boolean || false;
        setBiometricEnabled(userBiometricEnabled);

        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata.full_name as string,
          avatar_url: session.user.user_metadata.avatar_url as string,
          sfd_id: session.user.user_metadata.sfd_id as string,
          user_metadata: session.user.user_metadata || {},
          phone: session.user.user_metadata.phone as string,
          app_metadata: session.user.app_metadata || {},
          aud: session.user.aud || '',
          created_at: session.user.created_at || '',
        });

        // Set active SFD ID if available
        if (session.user.user_metadata.sfd_id) {
          setActiveSfdId(session.user.user_metadata.sfd_id as string);
        }
      } else {
        setUser(null);
        setActiveSfdId(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, useOtp: boolean = true) => {
    try {
      if (useOtp) {
        const { error } = await supabase.auth.signInWithOtp({ 
          email,
          options: {
            // This ensures we always get a fresh email
            emailRedirectTo: window.location.origin + '/auth'
          }
        });
        if (error) throw error;
        return;
      }
      
      // Fallback to password if not using OTP (for legacy support)
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password: 'PLACEHOLDER_PASSWORD' // This will be ignored when using magic link
      });
      if (error) throw error;
    } catch (error: any) {
      console.error("Authentication error:", error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: window.location.origin + '/auth'
        },
      });
      
      if (error) throw error;
      
      alert('Veuillez vérifier votre e-mail pour confirmer votre compte.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const verifyBiometricAuth = async (): Promise<boolean> => {
    try {
      // In a real implementation, this would integrate with device biometrics
      // For this demo, we're simulating successful verification
      console.log("Biometric authentication verified");
      return true;
    } catch (error) {
      console.error("Biometric verification failed:", error);
      return false;
    }
  };

  const toggleBiometricAuth = async (enabled: boolean): Promise<void> => {
    try {
      const { error } = await supabase.auth.updateUser({
        data: { biometric_enabled: enabled }
      });

      if (error) throw error;
      
      setBiometricEnabled(enabled);
    } catch (error) {
      console.error("Failed to toggle biometric authentication:", error);
      throw error;
    }
  };

  const value: AuthContextProps = {
    session,
    user,
    signIn,
    signOut,
    isLoading,
    loading: isLoading, // Alias for backward compatibility
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    signUp,
    verifyBiometricAuth,
    biometricEnabled,
    toggleBiometricAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
