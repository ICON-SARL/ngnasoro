
import React, { useContext, useEffect, useState, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { User, UserRole } from '@/hooks/auth/types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  userRole: string;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  biometricEnabled?: boolean;
  toggleBiometricAuth?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  useEffect(() => {
    // Check active auth session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
        // Create the user object with extra properties
        const userWithMeta = {
          ...session.user,
          full_name: session.user.user_metadata?.full_name || '',
          avatar_url: session.user.user_metadata?.avatar_url,
          sfd_id: session.user.app_metadata?.sfd_id,
          phone: session.user.phone || session.user.user_metadata?.phone
        } as User;
        
        setUser(userWithMeta);
      } else {
        setUser(null);
      }
      
      // Try to get active SFD from localStorage if it exists
      const storedSfdId = localStorage.getItem('activeSfdId');
      if (storedSfdId) {
        setActiveSfdId(storedSfdId);
      }
      
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
          // Create the user object with extra properties
          const userWithMeta = {
            ...newSession.user,
            full_name: newSession.user.user_metadata?.full_name || '',
            avatar_url: newSession.user.user_metadata?.avatar_url,
            sfd_id: newSession.user.app_metadata?.sfd_id,
            phone: newSession.user.phone || newSession.user.user_metadata?.phone
          } as User;
          
          setUser(userWithMeta);
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update localStorage when activeSfdId changes
  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  }, [activeSfdId]);

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) throw error;
    return data;
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata || {},
      },
    });
    
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const refreshSession = async () => {
    setLoading(true);
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    
    if (data.session?.user) {
      // Create the user object with extra properties
      const userWithMeta = {
        ...data.session.user,
        full_name: data.session.user.user_metadata?.full_name || '',
        avatar_url: data.session.user.user_metadata?.avatar_url,
        sfd_id: data.session.user.app_metadata?.sfd_id,
        phone: data.session.user.phone || data.session.user.user_metadata?.phone
      } as User;
      
      setUser(userWithMeta);
    } else {
      setUser(null);
    }
    
    setLoading(false);
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    // In a real app, you would add biometric enrollment/validation logic here
    return Promise.resolve();
  };

  // Determine user role
  const userRole = user?.app_metadata?.role || 'client';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isSfdAdmin = userRole === 'sfd_admin';
  const isClient = !isAdmin && !isSfdAdmin;

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    isAdmin,
    isSfdAdmin,
    isClient,
    userRole,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled,
    toggleBiometricAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the User type for components that need it
export type { User };
