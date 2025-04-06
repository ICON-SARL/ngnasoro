
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { createUserFromSupabaseUser } from './authUtils';

export function useAuthMethods(
  setUser: (user: User | null) => void,
  setSession: (session: any | null) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Signing in with:", email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      console.log("Login success, session established for:", data?.session?.user.email);
      setSession(data?.session);
      // Convert Supabase User to our User type
      if (data?.session?.user) {
        setUser(createUserFromSupabaseUser(data.session.user));
      }
      
      return {};
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      
      if (data.session) {
        setSession(data.session);
        // Convert Supabase User to our User type
        setUser(createUserFromSupabaseUser(data.session.user));
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      console.log("Signing out...");
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('refreshSession error:', error);
      }
      
      if (data?.session) {
        setSession(data.session);
        // Convert Supabase User to our User type
        setUser(createUserFromSupabaseUser(data.session.user));
      }
    } catch (error) {
      console.error('Unexpected refreshSession error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBiometricAuth = async () => {
    // Implementation remains as placeholder
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
}
