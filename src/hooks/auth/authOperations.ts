
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { createUserFromSupabaseUser } from './authUtils';
import { useNavigate } from 'react-router-dom';

export const useAuthOperations = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      return { data };
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: error };
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      navigate('/auth');
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
      
      return data;
    } catch (error) {
      console.error('Unexpected refreshSession error:', error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    signIn,
    signUp,
    signOut,
    refreshSession,
    isLoading
  };
};
