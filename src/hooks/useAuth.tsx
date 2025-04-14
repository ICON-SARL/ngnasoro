
import React, { useContext, useEffect, useState, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
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
      setUser(session?.user ?? null);
      
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
        setUser(newSession?.user ?? null);
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

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const refreshSession = async () => {
    setLoading(true);
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    setUser(data.session?.user ?? null);
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
