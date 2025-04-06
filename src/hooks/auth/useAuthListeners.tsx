
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createUserFromSupabaseUser } from './authUtils';
import { User } from './types';

export function useAuthListeners(
  setUser: (user: User | null) => void,
  setSession: (session: any | null) => void,
  setLoading: (loading: boolean) => void
) {
  // Authentication state listener and session management
  useEffect(() => {
    console.log('Setting up authentication listeners...');
    setLoading(true);

    // Get the current session first
    const getInitialSession = async () => {
      try {
        console.log('Checking for existing session...');
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          console.log('Found existing session for:', currentSession.user.email);
          setSession(currentSession);
          // Convert Supabase User to our User type
          setUser(createUserFromSupabaseUser(currentSession.user));
        } else {
          console.log('No session found');
          setSession(null);
          setUser(null);
        }
        
      } catch (err) {
        console.error('Unexpected error getting session:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event, newSession?.user?.email);
      
      if (newSession) {
        setSession(newSession);
        // Convert Supabase User to our User type
        setUser(createUserFromSupabaseUser(newSession.user));
      } else {
        setSession(null);
        setUser(null);
      }
      
      setLoading(false);
    });

    // Initialize auth state
    getInitialSession();
    
    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setUser, setSession, setLoading]);
}
