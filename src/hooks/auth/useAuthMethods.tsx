
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthResponse } from './types';
import { createUserFromSupabaseUser } from './authUtils';

export const useAuthMethods = (
  setUser: (user: User | null) => void,
  setSession: (session: any | null) => void
) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Sign in with email and password
  const signIn = async ({ email, password }: { email: string, password: string }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      setUser(createUserFromSupabaseUser(data.user));
      setSession(data.session);
      return { data };
    } catch (err: any) {
      console.error('Unexpected error during sign in:', err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async ({ 
    email, 
    password, 
    options 
  }: { 
    email: string, 
    password: string, 
    options?: { data?: { [key: string]: any } } 
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: options
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
      
      // Don't set the user here as the signup might require email verification
      return { data };
    } catch (err: any) {
      console.error('Unexpected error during sign up:', err);
      return { error: err };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh the session
  const refreshSession = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      if (data.session) {
        setSession(data.session);
        setUser(createUserFromSupabaseUser(data.user));
      } else {
        // Session expired, user needs to sign in again
        setSession(null);
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle biometric authentication
  const toggleBiometricAuth = async (): Promise<void> => {
    // This is a placeholder for biometric auth (would need implementation)
    console.log('Toggle biometric auth functionality not yet implemented');
    return Promise.resolve();
  };

  return {
    signIn,
    signUp,
    signOut,
    refreshSession,
    toggleBiometricAuth,
    isLoading
  };
};
