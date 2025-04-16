
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import React from 'react';
import { User, AuthContextProps } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const isSfdAdmin = userRole === 'sfd_admin';
  const isClient = userRole === 'client' || userRole === 'user';

  useEffect(() => {
    console.log('AuthProvider: Initializing authentication...');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthProvider: Session loaded:', session ? 'Session found' : 'No session');
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = session.user.app_metadata?.role;
        console.log('User authenticated:', session.user.email);
        console.log('User role from metadata:', role);
        setUserRole(role || null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('AuthProvider: Auth state changed:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const role = session.user.app_metadata?.role;
        console.log('Auth state changed. New role:', role);
        setUserRole(role || null);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }

    return () => subscription.unsubscribe();
  }, []);

  const updateActiveSfdId = (sfdId: string | null) => {
    console.log('Setting active SFD ID in localStorage:', sfdId);
    setActiveSfdId(sfdId);
    
    if (sfdId) {
      localStorage.setItem('activeSfdId', sfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        const role = data.user.app_metadata?.role;
        console.log('Sign in successful. User role:', role);
        setUserRole(role || null);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      return { data: null, error };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign up error:', error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setSession(null);
      setUserRole(null);
      setActiveSfdId(null);
      localStorage.removeItem('activeSfdId');
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      return { error };
    }
  };

  const toggleBiometricAuth = async () => {
    try {
      setBiometricEnabled(!biometricEnabled);
      return Promise.resolve();
    } catch (error) {
      console.error('Error toggling biometric auth:', error);
      throw error;
    }
  };

  return React.createElement(
    AuthContext.Provider,
    {
      value: {
        user,
        session,
        userRole,
        loading,
        signIn,
        signOut,
        activeSfdId,
        setActiveSfdId: updateActiveSfdId,
        isAdmin,
        isSfdAdmin,
        isClient,
        biometricEnabled,
        toggleBiometricAuth,
        signUp
      }
    },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth called outside of AuthProvider!');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
