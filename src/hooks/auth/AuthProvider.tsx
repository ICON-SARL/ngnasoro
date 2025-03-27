
import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import AuthContext from './AuthContext';
import { User } from './types';
import { createUserFromSupabaseUser, isUserAdmin, getBiometricStatus } from './authUtils';

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
          setIsAdmin(isUserAdmin(session));
          setBiometricEnabled(getBiometricStatus(session));
          setUser(createUserFromSupabaseUser(session.user));

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
        setIsAdmin(isUserAdmin(session));
        setBiometricEnabled(getBiometricStatus(session));
        setUser(createUserFromSupabaseUser(session.user));

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

  const signIn = async (email: string, useOtp: boolean = false) => {
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
      
      // Use password authentication by default
      const { error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
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

  const value = {
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

export default AuthProvider;
