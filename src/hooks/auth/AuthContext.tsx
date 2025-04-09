
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, AuthError } from '@supabase/supabase-js';
import { secureStorage, getBiometricSettings, toggleBiometricAuthentication } from './secureStorageService';
import { User, Role, AuthContextProps } from './types';
import { createUserFromSupabaseUser, assignUserRole } from './authUtils';

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);

  // Computed properties
  const isLoggedIn = !!user;
  const isAdmin = userRole === 'admin';
  const isSfdAdmin = userRole === 'sfd_admin';

  useEffect(() => {
    // Check if biometric authentication is enabled
    setBiometricEnabled(getBiometricSettings());
  }, []);

  useEffect(() => {
    console.log('Setting up auth state listener and checking session');
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          const customUser = createUserFromSupabaseUser(currentSession.user);
          setUser(customUser);
          
          console.log('User authenticated with metadata:', {
            email: customUser.email,
            role: customUser.app_metadata?.role,
            metadata: customUser.app_metadata
          });
          
          // Assign user role after user state update
          setTimeout(() => {
            handleUserRoleAssignment(customUser.id);
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Check existing session
    const checkCurrentSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          if (currentSession.user) {
            const customUser = createUserFromSupabaseUser(currentSession.user);
            setUser(customUser);
            
            console.log('Authenticated user:', {
              id: customUser.id,
              email: customUser.email,
              full_name: customUser.full_name,
              avatar_url: customUser.avatar_url,
              phone: customUser.phone || '',
              sfd_id: customUser.sfd_id,
              user_metadata: customUser.user_metadata,
              app_metadata: customUser.app_metadata
            });
            
            // Assign user role
            await handleUserRoleAssignment(customUser.id);
          }
        }
      } catch (error) {
        console.error('Unexpected error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentSession();

    // Clean up listener
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // Handle user role assignment with fallbacks
  const handleUserRoleAssignment = async (userId: string) => {
    try {
      // First try to get role from user_roles table
      const roleFromTable = await assignUserRole(userId);
      
      if (roleFromTable) {
        setUserRole(roleFromTable);
        return;
      }
      
      // Fallback to app_metadata
      if (session?.user?.app_metadata?.role) {
        setUserRole(session.user.app_metadata.role as Role);
        return;
      }
      
      // Fallback to user_metadata
      if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role as Role);
        return;
      }
      
      // Default role
      setUserRole('user');
    } catch (error) {
      console.error('Error in handleUserRoleAssignment:', error);
      // Final fallback
      if (session?.user?.app_metadata?.role) {
        setUserRole(session.user.app_metadata.role as Role);
      } else {
        setUserRole('user');
      }
    }
  };

  // SignIn function
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('Une erreur inattendue est survenue lors de la connexion');
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // SignUp function
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        setError(error.message);
        console.error('Signup error:', error);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue lors de l\'inscription');
      console.error('Unexpected signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  // SignOut function
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // AuthStateChange will handle resetting user and session
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      setSession(data.session);
      if (data.session?.user) {
        const customUser = createUserFromSupabaseUser(data.session.user);
        setUser(customUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Toggle biometric authentication
  const toggleBiometricAuth = async () => {
    const newState = toggleBiometricAuthentication(biometricEnabled);
    setBiometricEnabled(newState);
    return Promise.resolve();
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    userRole,
    biometricEnabled,
    toggleBiometricAuth,
    isLoggedIn,
    isAdmin,
    isSfdAdmin,
    activeSfdId,
    setActiveSfdId,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
