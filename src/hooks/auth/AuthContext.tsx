import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useToast } from '@/hooks/use-toast';
import { cleanupAuthState, handleRobustSignOut } from '@/utils/auth/authCleanup';
import { UserRole, AuthContextProps, User } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Hiérarchie des rôles (du plus élevé au plus bas)
const ROLE_HIERARCHY = {
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

  // Helper functions to check user roles
  const isAdmin = userRole === UserRole.Admin;
  const isSfdAdmin = userRole === UserRole.SfdAdmin;
  const isClient = userRole === UserRole.Client;

  // Function to enhance user with additional properties
  const enhanceUser = (supabaseUser: SupabaseUser): User => {
    return {
      ...supabaseUser,
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.app_metadata?.full_name || '',
      avatar_url: supabaseUser.user_metadata?.avatar_url || supabaseUser.app_metadata?.avatar_url,
      sfd_id: supabaseUser.app_metadata?.sfd_id || supabaseUser.user_metadata?.sfd_id
    };
  };

  // Fonction pour obtenir le rôle le plus élevé
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

  // Fonction pour synchroniser les métadonnées utilisateur
  const syncUserMetadata = async (userId: string, role: UserRole): Promise<void> => {
    try {
      console.log('Synchronizing user metadata for role:', role);
      
      // Mettre à jour les métadonnées dans auth.users
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        app_metadata: { role }
      });
      
      if (error) {
        console.error('Error updating user metadata:', error);
      } else {
        console.log('User metadata synchronized successfully');
      }
    } catch (err) {
      console.error('Exception synchronizing user metadata:', err);
    }
  };

  // Fonction pour nettoyer les rôles en doublon
  const cleanupDuplicateRoles = async (userId: string, primaryRole: UserRole): Promise<void> => {
    try {
      console.log('Cleaning up duplicate roles for user:', userId, 'Primary role:', primaryRole);
      
      // Si l'utilisateur a un rôle spécifique (admin, sfd_admin, client), supprimer le rôle 'user'
      if (primaryRole !== UserRole.User) {
        const { error } = await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'user');
        
        if (error) {
          console.error('Error cleaning up duplicate roles:', error);
        } else {
          console.log('Duplicate user roles cleaned up successfully');
        }
      }
    } catch (err) {
      console.error('Exception cleaning up duplicate roles:', err);
    }
  };

  // Function to fetch user role from database with improved logic
  const fetchUserRole = async (userId: string): Promise<UserRole | null> => {
    try {
      setIsCheckingRole(true);
      console.log('Fetching roles for user:', userId);
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log('No roles found for user, assigning default user role');
        
        // Assigner le rôle par défaut 'user'
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'user' });
        
        if (insertError) {
          console.error('Error inserting default role:', insertError);
        }
        
        return UserRole.User;
      }

      const roles = data.map(r => r.role);
      console.log('User roles from database:', roles);
      
      // Obtenir le rôle le plus élevé
      const primaryRole = getHighestRole(roles);
      console.log('Primary role determined:', primaryRole);
      
      // Synchroniser les métadonnées et nettoyer les doublons en arrière-plan
      setTimeout(async () => {
        await syncUserMetadata(userId, primaryRole);
        await cleanupDuplicateRoles(userId, primaryRole);
      }, 0);
      
      return primaryRole;
    } catch (err) {
      console.error('Exception fetching user role:', err);
      return UserRole.User;
    } finally {
      setIsCheckingRole(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setLoading(false);
          return;
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          const enhancedUser = enhanceUser(data.session.user);
          setUser(enhancedUser);
          
          console.log('Initial session user:', {
            id: enhancedUser.id,
            email: enhancedUser.email,
            role: enhancedUser.app_metadata?.role,
          });
          
          // Fetch role from database as source of truth
          const dbRole = await fetchUserRole(enhancedUser.id);
          if (dbRole) {
            setUserRole(dbRole);
            console.log('User role set to:', dbRole);
          }
        } else {
          setUser(null);
          setUserRole(null);
        }
      } catch (err) {
        console.error('Error in auth initialization:', err);
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

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('Auth state change event:', event);
        
        if (newSession?.user) {
          const enhancedUser = enhanceUser(newSession.user);
          setUser(enhancedUser);
          setSession(newSession);
          
          console.log('Auth state changed:', {
            event,
            userId: enhancedUser.id,
            role: enhancedUser.app_metadata?.role,
          });
          
          // Fetch role from database
          const dbRole = await fetchUserRole(enhancedUser.id);
          if (dbRole) {
            setUserRole(dbRole);
            console.log('User role updated to:', dbRole);
          }
        } else {
          setUser(null);
          setSession(newSession);
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
      if (data.session?.user) {
        const enhancedUser = enhanceUser(data.session.user);
        setUser(enhancedUser);
      } else {
        setUser(null);
      }
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
