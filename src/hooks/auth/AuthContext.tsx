import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { User, UserRole, AuthContextProps } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Convert Supabase user to our User type
const mapSupabaseUser = (sbUser: SupabaseUser | null): User | null => {
  if (!sbUser) return null;

  return {
    id: sbUser.id,
    email: sbUser.email || '',
    displayName: sbUser.user_metadata?.full_name,
    full_name: sbUser.user_metadata?.full_name,
    role: (sbUser.app_metadata?.role as UserRole) || UserRole.USER,
    avatar_url: sbUser.user_metadata?.avatar_url,
    sfd_id: sbUser.user_metadata?.sfd_id || sbUser.app_metadata?.sfd_id,
    phone: sbUser.phone,
    user_metadata: sbUser.user_metadata,
    app_metadata: sbUser.app_metadata
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | undefined>(undefined);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  // Added computed properties for role-based checks
  const isAdmin = user?.role === UserRole.SUPER_ADMIN;
  const isSfdAdmin = user?.role === UserRole.SFD_ADMIN;

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
          setUser(mapSupabaseUser(data.session.user));
        } else {
          setUser(null);
        }
        
        // Debug log
        if (data.session?.user) {
          console.log('Loaded user data:', {
            id: data.session.user.id,
            email: data.session.user.email,
            role: data.session.user.app_metadata?.role,
            metadata: data.session.user.app_metadata,
          });
        }
      } catch (err) {
        console.error('Error in auth session fetching:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        if (newSession?.user) {
          setUser(mapSupabaseUser(newSession.user));
        } else {
          setUser(null);
        }
        setSession(newSession);
        setLoading(false);
        
        // Debug log for auth state change
        if (newSession?.user) {
          console.log('Auth state changed:', {
            event,
            userId: newSession.user.id,
            role: newSession.user.app_metadata?.role,
            metadata: newSession.user.app_metadata,
          });
        }
        
        // Log auth events
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
      } else if (result.data.user) {
        console.log('Login successful:', {
          userId: result.data.user.id,
          role: result.data.user.app_metadata?.role,
          metadata: result.data.user.app_metadata,
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    }
  };

  const signUp = async (email: string, password: string, userData: Partial<User>) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: userData.full_name,
            avatar_url: userData.avatar_url,
            sfd_id: userData.sfd_id,
            role: userData.role || UserRole.USER
          }
        }
      });
      
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      const result = await supabase.auth.signOut();
      return result;
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
        setUser(mapSupabaseUser(data.session.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Updated to accept a boolean parameter
  const toggleBiometricAuth = (enabled: boolean) => {
    setBiometricEnabled(enabled);
  };

  const value: AuthContextProps = {
    user,
    session,
    loading,
    isAdmin,
    isSfdAdmin,
    signIn,
    signUp,
    signOut,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled,
    toggleBiometricAuth,
    refreshSession
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
