
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useToast } from '@/hooks/use-toast';
import { User, AuthContextProps, UserRole } from './types';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [isCheckingRole, setIsCheckingRole] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const { toast } = useToast();

  // Helper function to convert string role to UserRole enum
  const stringToUserRole = (role: string | null | undefined): UserRole | null => {
    if (!role) return null;
    
    const normalizedRole = role.toLowerCase();
    console.log('AuthContext: Converting role:', { original: role, normalized: normalizedRole });
    
    switch(normalizedRole) {
      case 'admin':
        return UserRole.Admin;
      case 'sfd_admin':
        return UserRole.SfdAdmin;
      case 'client':
      case 'user':
        return UserRole.Client;
      default:
        console.log(`AuthContext: Unknown role type: ${role}, defaulting to Client`);
        return UserRole.Client;
    }
  };

  // Determine user role using database as single source of truth
  const determineUserRole = async (userId: string) => {
    console.log('AuthContext: Determining user role for:', userId);
    setIsCheckingRole(true);

    try {
      // Check roles from database first
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error) {
        console.error('AuthContext: Error fetching user roles:', error);
        // Default to Client if error
        setUserRole(UserRole.Client);
        setIsClient(true);
        setIsAdmin(false);
        setIsSfdAdmin(false);
        return;
      }
      
      console.log('AuthContext: Found user roles in database:', userRoles);
      
      // Check for the most privileged roles first
      if (userRoles.some(r => r.role === 'admin')) {
        console.log('AuthContext: Setting admin role');
        setUserRole(UserRole.Admin);
        setIsAdmin(true);
        setIsSfdAdmin(false);
        setIsClient(false);
        sessionStorage.setItem('user_role', 'admin');
      } else if (userRoles.some(r => r.role === 'sfd_admin')) {
        console.log('AuthContext: Setting sfd_admin role');
        setUserRole(UserRole.SfdAdmin);
        setIsAdmin(false);
        setIsSfdAdmin(true);
        setIsClient(false);
        sessionStorage.setItem('user_role', 'sfd_admin');
      } else if (userRoles.some(r => ['client', 'user'].includes(r.role))) {
        console.log('AuthContext: Setting client role');
        setUserRole(UserRole.Client);
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setIsClient(true);
        sessionStorage.setItem('user_role', 'client');
      } else {
        // Default to Client if no specific role found
        console.log('AuthContext: No specific role found, defaulting to Client');
        setUserRole(UserRole.Client);
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setIsClient(true);
        sessionStorage.setItem('user_role', 'client');
      }
    } catch (error) {
      console.error('AuthContext: Error determining user role:', error);
      setUserRole(UserRole.Client);
      setIsClient(true);
      setIsAdmin(false);
      setIsSfdAdmin(false);
    } finally {
      setIsCheckingRole(false);
    }
  };

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error fetching session:', error);
          return;
        }
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        // Determine user role if user exists
        if (data.session?.user) {
          await determineUserRole(data.session.user.id);
        }
      } catch (err) {
        console.error('AuthContext: Error in auth session fetching:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        console.log('AuthContext: Auth state change event:', event);
        setUser(newSession?.user || null);
        setSession(newSession);
        
        // Update user role when auth state changes
        if (newSession?.user) {
          setTimeout(() => {
            determineUserRole(newSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
          setIsAdmin(false);
          setIsSfdAdmin(false);
          setIsClient(false);
          setIsCheckingRole(false);
          sessionStorage.removeItem('user_role');
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
      const result = await supabase.auth.signInWithPassword({ email, password });
      
      if (result.error) {
        console.error('AuthContext: Sign in error:', result.error);
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
        console.log('AuthContext: Login successful:', {
          userId: result.data.user.id,
          role: result.data.user.app_metadata?.role,
          metadata: result.data.user.app_metadata,
        });
        
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
        });
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Error signing in:', error);
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        console.error('AuthContext: Sign up error:', error);
        return { error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('AuthContext: Error in signUp:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Signing out user');
      const userId = user?.id;
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      const result = await supabase.auth.signOut();
      
      if (result.error) {
        console.error('AuthContext: Error during signOut:', result.error);
        toast({
          title: "Erreur de déconnexion",
          description: result.error.message || "Une erreur s'est produite lors de la déconnexion",
          variant: "destructive"
        });
      } else {
        console.log('AuthContext: SignOut successful');
        setUser(null);
        setSession(null);
        setUserRole(null);
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setIsClient(false);
        sessionStorage.removeItem('user_role');
        
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès"
        });
        
        window.location.href = '/auth';
      }
      
      return result;
    } catch (error) {
      console.error('AuthContext: Exception during signOut:', error);
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
        console.error('AuthContext: Error refreshing session:', error);
        return;
      }
      
      setSession(data.session);
      setUser(data.session?.user || null);
    } catch (error) {
      console.error('AuthContext: Error refreshing session:', error);
    }
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    return Promise.resolve();
  };

  const updateActiveSfdId = (sfdId: string) => {
    setActiveSfdId(sfdId);
  };

  const value: AuthContextProps = {
    user,
    session,
    loading,
    userRole,
    isAdmin,
    isSfdAdmin,
    isClient,
    isCheckingRole,
    activeSfdId,
    setActiveSfdId: updateActiveSfdId,
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
