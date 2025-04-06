
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

  useEffect(() => {
    console.log("Setting up auth state listener and checking session");
    
    // Set up auth state listener FIRST
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email);
      
      if (newSession) {
        setSession(newSession);
        if (newSession.user) {
          const mappedUser = createUserFromSupabaseUser(newSession.user);
          console.log("Setting user from auth state change:", mappedUser);
          setUser(mappedUser);
        }
      } else {
        setUser(null);
        setSession(null);
      }
      
      setLoading(false);
      
      if (newSession?.user) {
        console.log("User authenticated:", {
          email: newSession.user.email,
          role: newSession.user.app_metadata?.role
        });
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      }
    });
    
    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email);
      
      if (currentSession) {
        setSession(currentSession);
        if (currentSession.user) {
          const mappedUser = createUserFromSupabaseUser(currentSession.user);
          console.log("Setting user from initial session:", mappedUser);
          setUser(mappedUser);
        }
      }
      
      setLoading(false);
    }).catch(error => {
      console.error("Error fetching initial session:", error);
      setLoading(false);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
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
      
      if (data?.session) {
        console.log("Sign in successful, setting user session:", data.session.user.email);
        const mappedUser = createUserFromSupabaseUser(data.session.user);
        setUser(mappedUser);
        setSession(data.session);
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
      setLoading(true);
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
        const mappedUser = createUserFromSupabaseUser(data.session.user);
        setUser(mappedUser);
        setSession(data.session);
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
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
        if (data.session.user) {
          const mappedUser = createUserFromSupabaseUser(data.session.user);
          setUser(mappedUser);
        }
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
