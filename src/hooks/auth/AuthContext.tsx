
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { User, AuthContextProps, UserRole, Role } from './types';
import { createUserFromSupabaseUser } from './authUtils';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Compute role properties based on user metadata
  const userRole = user?.app_metadata?.role as UserRole || UserRole.User;
  
  // Fix the role comparison by comparing string values
  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.SuperAdmin || userRole === 'admin';
  const isSfdAdmin = userRole === UserRole.SfdAdmin || userRole === 'sfd_admin';
  const isClient = userRole === UserRole.Client || userRole === 'client' || userRole === 'user';

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        setSession(data.session);
        if (data.session?.user) {
          const transformedUser = createUserFromSupabaseUser(data.session.user);
          setUser(transformedUser);
          
          console.log('AuthContext - Loaded user data:', {
            id: transformedUser.id,
            email: transformedUser.email,
            role: transformedUser.app_metadata?.role,
            metadata: transformedUser.app_metadata,
          });
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth session fetching:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        
        if (newSession?.user) {
          const transformedUser = createUserFromSupabaseUser(newSession.user);
          setUser(transformedUser);
          
          console.log('Auth state changed - User role:', transformedUser.app_metadata?.role);
        } else {
          setUser(null);
        }
        
        setSession(newSession);
        setLoading(false);
        
        if (event === 'SIGNED_IN') {
          await logAuditEvent(
            AuditLogCategory.AUTHENTICATION,
            'user_login',
            {
              login_method: 'password',
              timestamp: new Date().toISOString(),
              user_role: newSession?.user.app_metadata?.role
            },
            newSession?.user.id,
            AuditLogSeverity.INFO,
            'success'
          );
        } else if (event === 'SIGNED_OUT') {
          await logAuditEvent(
            AuditLogCategory.AUTHENTICATION,
            'user_logout',
            {
              timestamp: new Date().toISOString()
            },
            user?.id,
            AuditLogSeverity.INFO,
            'success'
          );
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const loadBiometricPreference = async () => {
      try {
        const storedPreference = localStorage.getItem('biometricEnabled');
        if (storedPreference !== null) {
          setBiometricEnabled(storedPreference === 'true');
        }
      } catch (error) {
        console.error('Error loading biometric preference:', error);
      }
    };

    loadBiometricPreference();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        await logAuditEvent(
          AuditLogCategory.AUTHENTICATION,
          'failed_login',
          {
            email,
            reason: result.error.message,
            timestamp: new Date().toISOString()
          },
          undefined,
          AuditLogSeverity.WARNING,
          'failure'
        );
        return { error: result.error };
      } else if (result.data.user) {
        console.log('Login successful:', {
          userId: result.data.user.id,
          role: result.data.user.app_metadata?.role,
          metadata: result.data.user.app_metadata,
        });
        return { error: null, data: result.data };
      }
      
      return { error: null, data: result.data };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...metadata,
            role: 'client'
          }
        }
      });
      
      if (error) {
        console.error('Error signing up:', error);
        return { error };
      }
      
      if (data.user) {
        try {
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: 'user'
            });
            
          if (roleError) {
            console.error('Error creating user_role entry:', roleError);
          }
        } catch (roleErr) {
          console.error('Error creating user role:', roleErr);
        }
      }
      
      return { error: null, data };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("SignOut started - clearing localStorage items");
      localStorage.removeItem('adminLastSeen');
      localStorage.removeItem('sb-xnqysvnychmsockivqhb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      console.log("Calling supabase.auth.signOut()");
      const result = await supabase.auth.signOut();
      console.log("SignOut result:", result);
      
      setUser(null);
      setSession(null);
      
      return { error: result.error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      setSession(data.session);
      if (data.session?.user) {
        const transformedUser = createUserFromSupabaseUser(data.session.user);
        setUser(transformedUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const toggleBiometricAuth = async () => {
    try {
      const newState = !biometricEnabled;
      setBiometricEnabled(newState);
      localStorage.setItem('biometricEnabled', String(newState));
    } catch (error) {
      console.error('Error toggling biometric auth:', error);
    }
  };

  const value: AuthContextProps = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    refreshSession,
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    isSfdAdmin,
    isClient,
    userRole,
    biometricEnabled,
    toggleBiometricAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
