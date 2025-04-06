import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, AuthContextProps, Role } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { createUserFromSupabaseUser } from './authUtils';

interface AuthContextType extends AuthContextProps { }

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  signIn: async () => ({}),
  signUp: async () => { },
  signOut: async () => { },
  loading: true,
  isLoggedIn: false,
  isAdmin: false,
  isSfdAdmin: false,
  activeSfdId: null,
  setActiveSfdId: () => { },
  userRole: null,
  biometricEnabled: false,
  toggleBiometricAuth: async () => { },
  session: null,
  isLoading: false,
  refreshSession: async () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const assignUserRole = useCallback(async (user: User) => {
    if (!user || !user.app_metadata?.role || user.app_metadata.role_assigned) return;
    
    try {
      const validRole = user.app_metadata.role as "admin" | "sfd_admin" | "user";
      
      const { data: roleData, error: roleError } = await supabase.rpc('assign_role', {
        user_id: user.id,
        role: validRole
      });
      
      if (!roleError) {
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            ...user.app_metadata,
            role_assigned: true
          }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }
      } else {
        console.error('Error assigning role:', roleError);
      }
    } catch (err) {
      console.error('Error in assign_role process:', err);
    }
  }, []);

  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }
  }, []);

  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  }, [activeSfdId]);

  useEffect(() => {
    const checkBiometricSupport = async () => {
      if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
        try {
          const isConditionalMediationAvailable = await (window.PublicKeyCredential as any).isConditionalMediationAvailable();
          setBiometricEnabled(!!isConditionalMediationAvailable);
        } catch (error) {
          console.error("Error checking biometric support:", error);
          setBiometricEnabled(false);
        }
      } else {
        setBiometricEnabled(false);
      }
    };

    checkBiometricSupport();
  }, []);

  useEffect(() => {
    if (user) {
      assignUserRole(user);
    }
  }, [user, assignUserRole]);

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
          setUser(currentSession.user);
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
        setUser(newSession.user);
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
  }, []);

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
      setUser(data?.session?.user);
      
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
        setUser(data.session.user);
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
        setUser(data.session.user);
      }
    } catch (error) {
      console.error('Unexpected refreshSession error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(prev => !prev);
  };

  const isAdmin = user?.app_metadata?.role === 'admin';
  const isSfdAdmin = user?.app_metadata?.role === 'sfd_admin';
  const userRole = user?.app_metadata?.role as Role | null;

  const value: AuthContextType = {
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    loading,
    isLoggedIn: !!user,
    isAdmin,
    isSfdAdmin,
    activeSfdId,
    setActiveSfdId,
    userRole,
    biometricEnabled,
    toggleBiometricAuth,
    session,
    isLoading,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
