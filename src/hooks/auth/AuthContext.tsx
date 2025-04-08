
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, User, UserRole } from './types';
import { Session } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

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
          // Extend the user object with additional properties
          const extendedUser: User = {
            ...data.session.user,
            role: data.session.user.app_metadata?.role as UserRole,
            full_name: data.session.user.user_metadata?.full_name,
            avatar_url: data.session.user.user_metadata?.avatar_url,
            sfd_id: data.session.user.user_metadata?.sfd_id
          };
          
          setUser(extendedUser);
          
          // Debug log
          console.log('Loaded user data:', {
            id: extendedUser.id,
            email: extendedUser.email,
            role: extendedUser.role,
            metadata: extendedUser.user_metadata,
            full_name: extendedUser.full_name,
            sfd_id: extendedUser.sfd_id
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
        setSession(newSession);
        
        if (newSession?.user) {
          // Extend the user object with additional properties
          const extendedUser: User = {
            ...newSession.user,
            role: newSession.user.app_metadata?.role as UserRole,
            full_name: newSession.user.user_metadata?.full_name,
            avatar_url: newSession.user.user_metadata?.avatar_url,
            sfd_id: newSession.user.user_metadata?.sfd_id
          };
          
          setUser(extendedUser);
          
          // Debug log for auth state change
          console.log('Auth state changed:', {
            event,
            userId: extendedUser.id,
            role: extendedUser.role,
            full_name: extendedUser.full_name,
            sfd_id: extendedUser.sfd_id
          });
        } else {
          setUser(null);
        }
        
        setLoading(false);
        
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
  
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata
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
      setUser(data.session?.user as User || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Check if user is an admin or SFD admin
  const isAdmin = !!user?.role && user.role === UserRole.SUPER_ADMIN;
  const isSfdAdmin = !!user?.role && user.role === UserRole.SFD_ADMIN;
  const isAuthenticated = !!user;

  // Get active SFD ID from user metadata
  const activeSfdId = user?.sfd_id;

  const value = {
    user,
    session,
    loading,
    isAdmin,
    isSfdAdmin,
    isAuthenticated,
    activeSfdId,
    signIn,
    signUp,
    signOut,
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
