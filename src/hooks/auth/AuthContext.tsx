
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole, AuthContextProps } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>(UserRole.User);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Derived state for role checks
  const isAdmin = userRole === UserRole.SuperAdmin;
  const isSfdAdmin = userRole === UserRole.SfdAdmin;
  const isClient = userRole === UserRole.Client;

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user as User || null);
        setLoading(false);

        // Extract role from user metadata if available
        if (newSession?.user) {
          const role = newSession.user.app_metadata?.role || UserRole.User;
          setUserRole(role);
        } else {
          setUserRole(UserRole.User);
        }
      }
    );

    // Check for existing session on load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user as User || null);
      
      if (currentSession?.user) {
        const role = currentSession.user.app_metadata?.role || UserRole.User;
        setUserRole(role);
      }
      
      setLoading(false);
    });

    // Load stored SFD ID
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }

    // Check if biometric auth is enabled
    const bioEnabled = localStorage.getItem('biometricEnabled') === 'true';
    setBiometricEnabled(bioEnabled);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Save active SFD ID to local storage whenever it changes
  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  // Authentication methods
  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {},
        },
      });
      return { data, error };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Clear any local state before signing out
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.refreshSession();
      setSession(data.session);
      setUser(data.session?.user as User || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const toggleBiometricAuth = async () => {
    const newState = !biometricEnabled;
    setBiometricEnabled(newState);
    localStorage.setItem('biometricEnabled', String(newState));
    return Promise.resolve();
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isSfdAdmin,
    isClient,
    activeSfdId,
    setActiveSfdId,
    signIn,
    signUp,
    signOut,
    refreshSession,
    biometricEnabled,
    toggleBiometricAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
