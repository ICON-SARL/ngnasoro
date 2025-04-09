
import React, { useState, useEffect, useContext, useCallback, createContext } from 'react';
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
  const navigate = useNavigate();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Handle role assignment without causing infinite recursion
  const assignUserRole = useCallback(async (userId: string, role: Role) => {
    if (!userId || !role) return;
    
    try {
      // Use a direct rpc call instead of a nested query that could cause recursion
      const { data: roleData, error: roleError } = await supabase.rpc('assign_role', {
        user_id: userId,
        role // Pass the role directly, it's already the correct string type
      });
      
      if (roleError) {
        console.error('Error assigning role:', roleError);
      }
      
      return { success: !roleError };
    } catch (err) {
      console.error('Error in assign_role process:', err);
      return { success: false, error: err };
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
    if (user?.id && user?.app_metadata?.role && !user?.app_metadata?.role_assigned) {
      assignUserRole(user.id, user.app_metadata.role);
    }
  }, [user, assignUserRole]);

  useEffect(() => {
    console.log("Setting up auth state listener and checking session");
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email);
      
      if (newSession?.user) {
        const mappedUser = createUserFromSupabaseUser(newSession.user);
        setUser(mappedUser);
        
        // Log additional user data to troubleshoot role issues
        console.log("User authenticated with metadata:", {
          email: newSession.user.email,
          role: newSession.user.app_metadata?.role,
          metadata: newSession.user.app_metadata,
          user_metadata: newSession.user.user_metadata
        });
      } else {
        setUser(null);
      }
      setSession(newSession);
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
    
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      console.log("Initial session check:", currentSession?.user?.email);
      
      if (currentSession) {
        setSession(currentSession);
        if (currentSession.user) {
          const mappedUser = createUserFromSupabaseUser(currentSession.user);
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
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      
      if (data.session) {
        const mappedUser = createUserFromSupabaseUser(data.session.user);
        setUser(mappedUser);
        setSession(data.session);
      }
      
      return {};
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    try {
      setLoading(true);
      console.log("Attempting to sign up user:", email, "with metadata:", metadata);
      
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
        console.log("User signed up successfully:", data.user);
      } else {
        console.log("Sign up successful but no session returned (email confirmation might be required)");
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
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      setUser(null);
      setSession(null);
      navigate('/auth');
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

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
