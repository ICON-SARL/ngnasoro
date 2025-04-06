
import { useState } from 'react';
import { User, AuthResponse } from './types';
import { supabase } from '@/integrations/supabase/client';

export function useAuthMethods(
  setUser: (user: User | null) => void,
  setSession: (session: any | null) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  // Sign in with email and password
  const signIn = async ({ email, password }: { email: string, password: string }) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      setUser(data.user as unknown as User);
      setSession(data.session);
      return { data };
    } catch (error: any) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async ({ email, password, options }: { email: string, password: string, options?: any }): Promise<AuthResponse> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options
      });
      
      if (error) {
        return { error };
      }
      
      return { data };
    } catch (error: any) {
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      if (data && data.session) {
        setSession(data.session);
        setUser(data.user as unknown as User);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle biometric authentication
  const toggleBiometricAuth = async () => {
    // Implement biometric authentication logic here
    console.log('toggleBiometricAuth called');
  };

  return {
    signIn,
    signUp,
    signOut,
    refreshSession,
    toggleBiometricAuth,
    isLoading
  };
}
