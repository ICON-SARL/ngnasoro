
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
  const isAdmin = userRole === UserRole.SuperAdmin || userRole === 'admin';
  const isSfdAdmin = userRole === UserRole.SfdAdmin || userRole === 'sfd_admin';
  const isClient = userRole === UserRole.Client || userRole === 'client';

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state change event:', event);
        
        setSession(newSession);
        setUser(newSession?.user as User || null);
        setLoading(false);

        // Extract role from user metadata if available
        if (newSession?.user) {
          const role = newSession.user.app_metadata?.role || UserRole.User;
          console.log('User role from event:', role);
          setUserRole(role);
        } else {
          setUserRole(UserRole.User);
        }
      }
    );

    // Check for existing session on load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log('Current session on load:', currentSession ? 'exists' : 'null');
      
      setSession(currentSession);
      setUser(currentSession?.user as User || null);
      
      if (currentSession?.user) {
        const role = currentSession.user.app_metadata?.role || UserRole.User;
        console.log('User role from initial load:', role);
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
      console.log('Attempting to sign in with email:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
      } else if (data.user) {
        console.log('Sign in successful for user:', data.user.id);
        console.log('User role:', data.user.app_metadata?.role);
      }
      
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
      console.log('Signing out user');
      
      // Clear any local state before signing out
      setUser(null);
      setSession(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Error during signOut:', error);
      } else {
        console.log('SignOut successful');
        // Force page reload to clear any remaining state
        window.location.href = '/auth';
      }
      
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
