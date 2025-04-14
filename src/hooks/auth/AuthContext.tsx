
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { UserRole } from './types';

interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  userRole: UserRole | string;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isClient: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | string>('');
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);

  // Check if user has admin, sfd_admin, or client role
  const isAdmin = userRole === UserRole.SuperAdmin || userRole === 'admin';
  const isSfdAdmin = userRole === UserRole.SfdAdmin || userRole === 'sfd_admin';
  const isClient = userRole === UserRole.Client || userRole === 'client' || userRole === 'user';

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth context...');
        
        // Set up auth state listener FIRST
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log('Auth state change event:', event);
            
            // Simple synchronous state updates in callback
            setSession(newSession);
            setUser(newSession?.user ?? null);
            
            const role = newSession?.user?.app_metadata?.role || 'user';
            setUserRole(role);
            console.log('Auth state changed - User role:', role);
            
            // Log auth events
            if (event === 'SIGNED_IN' && newSession?.user) {
              setTimeout(() => {
                logAuditEvent(
                  AuditLogCategory.AUTHENTICATION,
                  'user_login',
                  {
                    login_method: 'password',
                    timestamp: new Date().toISOString(),
                    user_role: role
                  },
                  newSession.user.id,
                  AuditLogSeverity.INFO,
                  'success'
                ).catch(err => console.error('Error logging audit event:', err));
              }, 0);
            } else if (event === 'SIGNED_OUT') {
              setTimeout(() => {
                if (user?.id) {
                  logAuditEvent(
                    AuditLogCategory.AUTHENTICATION,
                    'user_logout',
                    {
                      timestamp: new Date().toISOString()
                    },
                    user.id,
                    AuditLogSeverity.INFO,
                    'success'
                  ).catch(err => console.error('Error logging audit event:', err));
                }
              }, 0);
            }
          }
        );

        // Add a timeout to prevent infinite loading
        const sessionTimeout = setTimeout(() => {
          if (loading) {
            console.log('Session check timed out, defaulting to not authenticated');
            setLoading(false);
            setAuthInitialized(true);
          }
        }, 5000); // 5 second timeout
        
        // THEN check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        // Clear the timeout as the request has completed
        clearTimeout(sessionTimeout);
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(data.session.user);
          setUserRole(data.session.user.app_metadata?.role || 'user');
          
          // Debug log
          console.log('Loaded user data:', {
            id: data.session.user.id,
            email: data.session.user.email,
            role: data.session.user.app_metadata?.role,
            metadata: data.session.user.app_metadata,
          });
        }
        
        setLoading(false);
        setAuthInitialized(true);
        
        return () => {
          subscription.unsubscribe();
          clearTimeout(sessionTimeout);
        };
      } catch (err) {
        console.error('Error in auth initialization:', err);
        setLoading(false);
        setAuthInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        console.error('Login error:', result.error);
        setTimeout(() => {
          logAuditEvent(
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
          ).catch(err => console.error('Error logging audit event:', err));
        }, 0);
      } else if (result.data.user) {
        console.log('Login successful:', {
          userId: result.data.user.id,
          role: result.data.user.app_metadata?.role,
          metadata: result.data.user.app_metadata,
        });
      }
      
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      setLoading(false);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const result = await supabase.auth.signOut();
      setLoading(false);
      return result;
    } catch (error) {
      console.error('Error signing out:', error);
      setLoading(false);
      return { error };
    }
  };

  const refreshSession = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Error refreshing session:', error);
        setLoading(false);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
      setUserRole(data.session?.user?.app_metadata?.role || 'user');
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setLoading(false);
    }
  };

  // Only render the app once auth is initialized
  if (!authInitialized) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Initialisation du système...</p>
        </div>
      </div>
    );
  }

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isSfdAdmin,
    isClient,
    activeSfdId,
    setActiveSfdId,
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
