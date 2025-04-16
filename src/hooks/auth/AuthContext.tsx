import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { User, UserRole, AuthContextProps } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | string>('');
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const isAdmin = userRole === UserRole.SuperAdmin || userRole === 'admin';
  const isSfdAdmin = userRole === UserRole.SfdAdmin || userRole === 'sfd_admin';
  const isClient = userRole === UserRole.Client || userRole === 'client' || userRole === 'user';

  const adaptUser = (sbUser: any): User | null => {
    if (!sbUser) return null;
    
    return {
      ...sbUser,
      full_name: sbUser.user_metadata?.full_name,
      avatar_url: sbUser.user_metadata?.avatar_url,
      phone: sbUser.user_metadata?.phone,
      sfd_id: sbUser.app_metadata?.sfd_id,
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth context...');
        
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, newSession) => {
            console.log('Auth state change event:', event);
            
            setSession(newSession);
            setUser(adaptUser(newSession?.user));
            
            const role = newSession?.user?.app_metadata?.role || 'user';
            setUserRole(role);
            console.log('Auth state changed - User role:', role);
            
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

        const sessionTimeout = setTimeout(() => {
          if (loading) {
            console.log('Session check timed out, defaulting to not authenticated');
            setLoading(false);
            setAuthInitialized(true);
          }
        }, 5000);

        const { data, error } = await supabase.auth.getSession();
        
        clearTimeout(sessionTimeout);
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          setAuthInitialized(true);
          return;
        }
        
        if (data?.session) {
          setSession(data.session);
          setUser(adaptUser(data.session.user));
          setUserRole(data.session.user.app_metadata?.role || 'user');
          
          console.log('Loaded user data:', {
            id: data.session.user.id,
            email: data.session.user.email,
            role: data.session.user.app_metadata?.role,
            metadata: data.session.user.app_metadata,
          });
          
          const { data: securityData } = await supabase
            .from('security_settings')
            .select('biometric_auth')
            .eq('user_id', data.session.user.id)
            .single();
            
          setBiometricEnabled(securityData?.biometric_auth || false);
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
        
        return { error: result.error };
      } else {
        console.log('Login successful:', {
          userId: result.data.user?.id,
          role: result.data.user?.app_metadata?.role,
          metadata: result.data.user?.app_metadata,
        });
        
        return { 
          error: null, 
          data: { 
            user: adaptUser(result.data.user),
            session: result.data.session 
          } 
        };
      }
    } catch (error) {
      console.error('Error signing in:', error);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        console.error('Signup error:', error);
        return { error };
      }
      
      return { 
        error: null, 
        data: { 
          user: adaptUser(data.user),
          session: data.session 
        } 
      };
    } catch (error) {
      console.error('Error signing up:', error);
      return { error };
    } finally {
      setLoading(false);
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
      setUser(adaptUser(data.session?.user));
      setUserRole(data.session?.user?.app_metadata?.role || 'user');
      setLoading(false);
    } catch (error) {
      console.error('Error refreshing session:', error);
      setLoading(false);
    }
  };
  
  const toggleBiometricAuth = async () => {
    if (!user) return;
    
    const newValue = !biometricEnabled;
    setBiometricEnabled(newValue);
    
    try {
      await supabase
        .from('security_settings')
        .upsert({
          user_id: user.id,
          biometric_auth: newValue,
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
    } catch (error) {
      console.error('Error updating biometric settings:', error);
      setBiometricEnabled(!newValue);
      throw error;
    }
  };

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
    signUp,
    signOut,
    refreshSession,
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
