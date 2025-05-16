
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useToast } from '@/hooks/use-toast';
import { User, AuthContextProps, UserRole } from './types';

// Helper function to convert string role to UserRole enum
function stringToUserRole(role: string): UserRole | null {
  if (!role) return null;
  
  switch(role.toLowerCase()) {
    case 'admin':
      return UserRole.Admin;
    case 'sfd_admin':
      return UserRole.SfdAdmin;
    case 'client':
      return UserRole.Client;
    case 'user':
      return UserRole.User;
    default:
      return null;
  }
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const { toast } = useToast();

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
        
        // Set user role
        if (data.session?.user) {
          const role = data.session.user.app_metadata?.role;
          const userRoleEnum = stringToUserRole(role);
          setUserRole(userRoleEnum);
          
          // Set role flags
          if (userRoleEnum === UserRole.Admin || userRoleEnum === UserRole.SuperAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setIsSfdAdmin(userRoleEnum === UserRole.SfdAdmin);
          setIsClient(userRoleEnum === UserRole.Client);
          
          console.log('Loaded user data:', {
            id: data.session.user.id,
            email: data.session.user.email,
            role: role,
            userRoleEnum: userRoleEnum,
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
        console.log('Auth state change event:', event);
        setUser(newSession?.user || null);
        setSession(newSession);
        
        // Update user role when auth state changes
        if (newSession?.user) {
          const role = newSession.user.app_metadata?.role;
          const userRoleEnum = stringToUserRole(role);
          setUserRole(userRoleEnum);
          
          // Set role flags
          if (userRoleEnum === UserRole.Admin || userRoleEnum === UserRole.SuperAdmin) {
            setIsAdmin(true);
          } else {
            setIsAdmin(false);
          }
          setIsSfdAdmin(userRoleEnum === UserRole.SfdAdmin);
          setIsClient(userRoleEnum === UserRole.Client);
        } else {
          setUserRole(null);
          setIsAdmin(false);
          setIsSfdAdmin(false);
          setIsClient(false);
        }
        
        setLoading(false);
        
        // Debug log for auth state change
        if (newSession?.user) {
          console.log('Auth state changed:', {
            event,
            userId: newSession.user.id,
            role: newSession.user.app_metadata?.role,
            metadata: newSession.user.app_metadata,
          });
        } else {
          console.log('Auth state changed: User signed out');
        }
        
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
          // Only log if we have a user ID from before the signout
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
          metadata: result.data.user.app_metadata,
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) {
        console.error('Sign up error:', error);
        return { error };
      }
      
      return { data, error: null };
    } catch (error) {
      console.error('Error in signUp:', error);
      return { error, data: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('AuthProvider - Signing out user');
      const userId = user?.id; // Capture user ID before signout
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
      // Call Supabase signOut method
      const result = await supabase.auth.signOut();
      
      if (result.error) {
        console.error('Error during signOut:', result.error);
        toast({
          title: "Erreur de déconnexion",
          description: result.error.message || "Une erreur s'est produite lors de la déconnexion",
          variant: "destructive"
        });
      } else {
        console.log('AuthProvider - SignOut successful');
        // Clear local state immediately to avoid UI inconsistencies
        setUser(null);
        setSession(null);
        
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès"
        });
        
        // Force a full page reload to clear any remaining state
        window.location.href = '/auth';
      }
      
      return result;
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
    return Promise.resolve();
  };

  // Function to update active SFD ID
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
