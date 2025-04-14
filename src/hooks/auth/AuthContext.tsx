
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextProps, UserRole } from './types';

// Create auth context
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component that wraps your app and provides the auth context
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    // Check for an existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      
      if (session?.user) {
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
      
      const storedSfdId = localStorage.getItem('activeSfdId');
      if (storedSfdId) {
        setActiveSfdId(storedSfdId);
      }
      
      setLoading(false);
    });

    // Listen for changes to auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession);
        
        if (newSession?.user) {
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

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      
      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  // Refresh the session
  const refreshSession = async () => {
    setLoading(true);
    const { data } = await supabase.auth.refreshSession();
    setSession(data.session);
    
    if (data.session?.user) {
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

  // Toggle biometric authentication
  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    // Implementation would connect to native biometric APIs
    return Promise.resolve();
  };

  // Calculate user roles
  const userRoleStr = user?.app_metadata?.role || 'client';
  const isAdmin = userRoleStr === 'admin' || userRoleStr === 'super_admin';
  const isSfdAdmin = userRoleStr === 'sfd_admin';
  const isClient = !isAdmin && !isSfdAdmin;

  // Value object that will be provided to consumers of this context
  const value: AuthContextProps = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    isSfdAdmin,
    isClient,
    userRole: userRoleStr,
    biometricEnabled,
    toggleBiometricAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook that lets components access the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
