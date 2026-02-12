import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState, handleRobustSignOut } from '@/utils/auth/authCleanup';
import { UserRole, AuthContextProps, User } from './types';
import { logger } from '@/utils/logger';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

const ROLE_HIERARCHY = {
  [UserRole.SupportAdmin]: 5,
  [UserRole.Admin]: 4,
  [UserRole.SfdAdmin]: 3,
  [UserRole.Client]: 2,
  [UserRole.User]: 1
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isCheckingRole, setIsCheckingRole] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId && storedSfdId.trim() !== '') {
      setActiveSfdId(storedSfdId);
    }
  }, []);

  useEffect(() => {
    if (activeSfdId && activeSfdId.trim() !== '') {
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  const isAdmin = userRole === UserRole.Admin || userRole === UserRole.SupportAdmin;
  const isSfdAdmin = userRole === UserRole.SfdAdmin || userRole === UserRole.SupportAdmin;
  const isClient = userRole === UserRole.Client;

  const enhanceUser = (supabaseUser: SupabaseUser): User => ({
    ...supabaseUser,
    full_name: supabaseUser.user_metadata?.full_name || supabaseUser.app_metadata?.full_name || '',
    avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.app_metadata?.avatar_url,
    sfd_id: supabaseUser.app_metadata?.sfd_id || supabaseUser.user_metadata?.sfd_id
  });

  const getHighestRole = (roles: string[]): UserRole => {
    if (roles.length === 0) return UserRole.User;
    let highestRole = UserRole.User;
    let highestPriority = 0;
    roles.forEach(role => {
      const normalizedRole = role as UserRole;
      const priority = ROLE_HIERARCHY[normalizedRole] || 0;
      if (priority > highestPriority) {
        highestPriority = priority;
        highestRole = normalizedRole;
      }
    });
    return highestRole;
  };

  let lastRoleFetch: { userId: string; role: UserRole; timestamp: number } | null = null;

  const cleanupDuplicateRoles = async (userId: string, primaryRole: UserRole): Promise<void> => {
    try {
      if (primaryRole !== UserRole.User) {
        const { data: existingRoles } = await supabase
          .from('user_roles')
          .select('id, role')
          .eq('user_id', userId);
        
        const hasUserRole = existingRoles?.some(r => r.role === 'user');
        const hasOtherRoles = existingRoles?.some(r => r.role !== 'user');
        
        if (hasUserRole && hasOtherRoles) {
          logger.log('🧹 Cleaning up duplicate user role for:', userId);
          await supabase
            .from('user_roles')
            .delete()
            .eq('user_id', userId)
            .eq('role', 'user');
        }
      }
    } catch (err) {
      logger.error('❌ Error cleaning up duplicate roles:', err);
    }
  };

  const fetchUserRole = async (userId: string, forceRefresh = false): Promise<UserRole | null> => {
    if (!forceRefresh && lastRoleFetch?.userId === userId) {
      const age = Date.now() - lastRoleFetch.timestamp;
      if (age < 30000) {
        logger.debug('Using cached role:', lastRoleFetch.role);
        return lastRoleFetch.role;
      }
    }

    try {
      setIsCheckingRole(true);
      
      const timeoutId = setTimeout(() => {
        logger.warn('Role check timeout - forcing isCheckingRole to false');
        setIsCheckingRole(false);
      }, 2000);
      
      logger.debug('Fetching roles for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      clearTimeout(timeoutId);

      if (error) {
        logger.error('Error fetching user roles:', error);
        return null;
      }

      if (!data || data.length === 0) {
        logger.log('No roles found for user, assigning default user role');
        
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'user' });
        
        if (insertError) {
          logger.error('Error inserting default role:', insertError);
        }
        
        return UserRole.User;
      }

      const roles = data.map(r => r.role);
      logger.debug('User roles from database:', roles);
      
      const primaryRole = getHighestRole(roles);
      logger.log('Primary role determined:', primaryRole);
      
      lastRoleFetch = { userId, role: primaryRole, timestamp: Date.now() };
      
      setTimeout(async () => {
        await cleanupDuplicateRoles(userId, primaryRole);
      }, 0);
      
      return primaryRole;
    } catch (err) {
      logger.error('Exception fetching user role:', err);
      return UserRole.User;
    } finally {
      setIsCheckingRole(false);
    }
  };

  const forceRefreshRole = async (): Promise<UserRole | null> => {
    if (!user) return null;
    logger.log('🔄 Force refreshing role for user:', user.id);
    lastRoleFetch = null;
    const newRole = await fetchUserRole(user.id, true);
    if (newRole) setUserRole(newRole);
    return newRole;
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        logger.log('Starting auth initialization...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          logger.error('Error fetching session:', error);
          setLoading(false);
          return;
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          const enhancedUser = enhanceUser(data.session.user);
          setUser(enhancedUser);
          
          logger.debug('Initial session user:', { id: enhancedUser.id, email: enhancedUser.email });
          
          const dbRole = await fetchUserRole(enhancedUser.id);
          if (dbRole) {
            setUserRole(dbRole);
            logger.log('User role set to:', dbRole);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        logger.error('Error in auth initialization:', err);
        toast({
          title: "Erreur d'authentification",
          description: "Une erreur est survenue lors de l'initialisation. Veuillez rafraîchir la page.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    let authChangeTimeout: NodeJS.Timeout | null = null;
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        logger.log('📢 Auth state change event:', event);
        
        if (authChangeTimeout) clearTimeout(authChangeTimeout);
        
        authChangeTimeout = setTimeout(async () => {
          if (newSession?.user) {
            const enhancedUser = enhanceUser(newSession.user);
            setUser(enhancedUser);
            setSession(newSession);
            
            const dbRole = await fetchUserRole(enhancedUser.id, false);
            if (dbRole) {
              logger.debug('✅ Role fetched:', dbRole);
              setUserRole(dbRole);
            }
          } else {
            logger.log('🚪 User signed out, clearing state');
            setUser(null);
            setSession(newSession);
            setUserRole(null);
            setActiveSfdId(null);
          }
          
          setLoading(false);
          
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
              logger.error('Error logging sign-in event:', error);
            }
          } else if (event === 'SIGNED_OUT') {
            const userId = user?.id;
            if (userId) {
              try {
                await logAuditEvent(
                  AuditLogCategory.AUTHENTICATION,
                  'user_logout',
                  { timestamp: new Date().toISOString() },
                  userId,
                  AuditLogSeverity.INFO,
                  'success'
                );
              } catch (error) {
                logger.error('Error logging sign-out event:', error);
              }
            }
          }
        }, 200);
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
        logger.debug('Pre-signout cleanup (can be ignored):', err);
      }

      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        logger.error('Sign in error:', result.error);
        toast({
          title: "Erreur de connexion",
          description: result.error.message || "Impossible de se connecter",
          variant: "destructive"
        });
        
        try {
          await logAuditEvent(
            AuditLogCategory.AUTHENTICATION,
            'failed_login',
            { email, reason: result.error.message, timestamp: new Date().toISOString() },
            undefined,
            AuditLogSeverity.WARNING,
            'failure'
          );
        } catch (logError) {
          logger.error('Error logging failed login:', logError);
        }
      } else if (result.data.user) {
        logger.log('Login successful:', { userId: result.data.user.id });
        toast({ title: "Connexion réussie", description: "Vous êtes maintenant connecté" });
      }
      
      return result;
    } catch (error) {
      logger.error('Error signing in:', error);
      toast({ title: "Erreur de connexion", description: "Une erreur inattendue s'est produite", variant: "destructive" });
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, unknown>) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata || {} }
      });
      
      if (result.error) {
        toast({ title: "Erreur d'inscription", description: result.error.message, variant: "destructive" });
      } else {
        toast({ title: "Inscription réussie", description: "Veuillez vérifier votre email pour confirmer votre compte" });
      }
      
      return result;
    } catch (error) {
      logger.error('Error signing up:', error);
      toast({ title: "Erreur d'inscription", description: "Une erreur inattendue s'est produite", variant: "destructive" });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      logger.log('AuthContext - Starting robust sign out');
      toast({ title: "Déconnexion en cours", description: "Veuillez patienter..." });
      
      await handleRobustSignOut(supabase);
      
      setUser(null);
      setSession(null);
      setUserRole(null);
      setActiveSfdId(null);
      
      toast({ title: "Déconnexion réussie", description: "Vous avez été déconnecté avec succès" });
      return { error: null };
    } catch (error) {
      logger.error('Exception during signOut:', error);
      toast({ title: "Erreur de déconnexion", description: "Une erreur inattendue s'est produite", variant: "destructive" });
      return { error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        logger.error('Error refreshing session:', error);
        return;
      }
      setSession(data.session);
      if (data.session?.user) {
        setUser(enhanceUser(data.session.user));
      } else {
        setUser(null);
      }
    } catch (error) {
      logger.error('Error refreshing session:', error);
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
    user, session, loading, userRole,
    isAdmin, isSfdAdmin, isClient, isCheckingRole,
    activeSfdId, setActiveSfdId,
    signIn, signUp, signOut, refreshSession,
    forceRefreshRole, biometricEnabled, toggleBiometricAuth
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
