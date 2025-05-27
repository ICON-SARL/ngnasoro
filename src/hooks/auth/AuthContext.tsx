
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState, handleRobustSignOut } from '@/utils/auth/authCleanup';
import { UserRole, AuthContextProps } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { toast } = useToast();

  // Helper functions to check user roles
  const isAdmin = userRole === UserRole.Admin;
  const isSfdAdmin = userRole === UserRole.SfdAdmin;
  const isClient = userRole === UserRole.Client;

  // Function to fetch user role from database
  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      setIsCheckingRole(true);
      console.log('Fetching role for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return null;
      }

      console.log('User role from database:', data?.role);
      return data?.role as UserRole || null;
    } catch (err) {
      console.error('Exception fetching user role:', err);
      return null;
    } finally {
      setIsCheckingRole(false);
    }
  };

  // Function to sync metadata with database role
  const syncUserMetadata = async (user: User, dbRole: UserRole) => {
    try {
      const currentMetaRole = user.app_metadata?.role;
      if (currentMetaRole !== dbRole) {
        console.log('Syncing metadata - DB role:', dbRole, 'Meta role:', currentMetaRole);
        
        // Update metadata via admin function if needed
        const { error } = await supabase.rpc('sync_user_metadata', {
          user_id: user.id,
          new_role: dbRole
        });
        
        if (error) {
          console.error('Error syncing metadata:', error);
        }
      }
    } catch (err) {
      console.error('Exception syncing metadata:', err);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          console.log('Initial session user:', {
            id: data.session.user.id,
            email: data.session.user.email,
            role: data.session.user.app_metadata?.role,
          });
          
          // Fetch role from database as source of truth
          const dbRole = await fetchUserRole(data.session.user.id);
          if (dbRole) {
            setUserRole(dbRole);
            await syncUserMetadata(data.session.user, dbRole);
          }
        }
      } catch (err) {
        console.error('Error in auth initialization:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        setUser(newSession?.user || null);
        setSession(newSession);
        
        if (newSession?.user) {
          console.log('Auth state changed:', {
            event,
            userId: newSession.user.id,
            role: newSession.user.app_metadata?.role,
          });
          
          // Fetch role from database
          const dbRole = await fetchUserRole(newSession.user.id);
          if (dbRole) {
            setUserRole(dbRole);
            await syncUserMetadata(newSession.user, dbRole);
          }
        } else {
          setUserRole(null);
          setActiveSfdId(null);
        }
        
        setLoading(false);
        
        // Log auth events
        if (event === 'SIGNED_IN') {
          try {
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
          } catch (error) {
            console.error('Error logging sign-in event:', error);
          }
        } else if (event === 'SIGNED_OUT') {
          const userId = user?.id;
          if (userId) {
            try {
              await logAuditEvent(
                AuditLogCategory.AUTHENTICATION,
                'user_logout',
                {
                  timestamp: new Date().toISOString()
                },
                userId,
                AuditLogSeverity.INFO,
                'success'
              );
            } catch (error) {
              console.error('Error logging sign-out event:', error);
            }
          }
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      cleanupAuthState();
      
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Pre-signout cleanup (can be ignored):', err);
      }

      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        console.error('Sign in error:', result.error);
        toast({
          title: "Erreur de connexion",
          description: result.error.message || "Impossible de se connecter",
          variant: "destructive"
        });
        
        try {
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
        } catch (logError) {
          console.error('Error logging failed login:', logError);
        }
      } else if (result.data.user) {
        console.log('Login successful:', {
          userId: result.data.user.id,
          role: result.data.user.app_metadata?.role,
        });
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: "Erreur de connexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });
      
      if (result.error) {
        toast({
          title: "Erreur d'inscription",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Veuillez vérifier votre email pour confirmer votre compte",
        });
      }
      
      return result;
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: "Erreur d'inscription",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext - Starting robust sign out');
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      await handleRobustSignOut(supabase);
      
      setUser(null);
      setSession(null);
      setUserRole(null);
      setActiveSfdId(null);
      
      toast({
        title: "Déconnexion réussie",
        description: "Vous avez été déconnecté avec succès"
      });
      
      return { error: null };
    } catch (error) {
      console.error('Exception during signOut:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur inattendue s'est produite",
        variant: "destructive"
      });
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

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    toast({
      title: biometricEnabled ? "Biométrie désactivée" : "Biométrie activée",
      description: biometricEnabled ? "L'authentification biométrique a été désactivée" : "L'authentification biométrique a été activée"
    });
  };

  const value = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isSfdAdmin,
    isClient,
    isCheckingRole,
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
