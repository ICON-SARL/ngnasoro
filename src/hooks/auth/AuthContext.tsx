
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ data?: any; error?: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

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
        setUser(data.session?.user || null);
        
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
        setUser(newSession?.user || null);
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
        return { error: result.error };
      } else if (result.data.user) {
        console.log('Login successful:', {
          userId: result.data.user.id,
          role: result.data.user.app_metadata?.role,
          metadata: result.data.user.app_metadata,
        });
        return { data: result.data };
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
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
      setUser(data.session?.user || null);
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
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
