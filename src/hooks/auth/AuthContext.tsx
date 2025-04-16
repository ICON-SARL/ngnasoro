
import React, { useState, useEffect, useContext, createContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { User, UserRole, AuthContextProps } from './types';
import { logAuditEvent } from '@/utils/audit/auditLogger';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { useToast } from '@/hooks/use-toast';

// Create a context with the AuthContextProps type
const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Export the AuthProvider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<UserRole | string>(UserRole.User);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { toast } = useToast();

  // Initialize authentication state
  useEffect(() => {
    console.log('Initializing auth context...');
    
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          const role = data.session.user.app_metadata?.role || UserRole.User;
          setUserRole(role);
          
          // Set user with additional properties
          setUser({
            ...data.session.user,
            full_name: data.session.user.user_metadata?.full_name,
            avatar_url: data.session.user.user_metadata?.avatar_url,
            phone: data.session.user.user_metadata?.phone,
            sfd_id: data.session.user.user_metadata?.sfd_id,
          });
          
          console.log('Loaded user data:', {
            id: data.session.user.id,
            email: data.session.user.email,
            role: role,
            metadata: data.session.user.app_metadata,
          });

          // Check if there's a stored SFD ID in localStorage
          const storedSfdId = localStorage.getItem('activeSfdId');
          if (storedSfdId) {
            console.log('Found stored SFD ID:', storedSfdId);
            setActiveSfdId(storedSfdId);
          } else if (data.session.user.user_metadata?.sfd_id) {
            console.log('Using SFD ID from user metadata:', data.session.user.user_metadata.sfd_id);
            setActiveSfdId(data.session.user.user_metadata.sfd_id);
          }
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
        
        if (newSession?.user) {
          const role = newSession.user.app_metadata?.role || UserRole.User;
          setUserRole(role);
          
          setUser({
            ...newSession.user,
            full_name: newSession.user.user_metadata?.full_name,
            avatar_url: newSession.user.user_metadata?.avatar_url,
            phone: newSession.user.user_metadata?.phone,
            sfd_id: newSession.user.user_metadata?.sfd_id,
          });
          
          console.log('Auth state changed - User role:', role);
        } else {
          setUser(null);
          setUserRole(UserRole.User);
          console.log('Auth state changed: User signed out');
        }
        
        setSession(newSession);
        
        // Log authentication events
        if (event === 'SIGNED_IN' && newSession) {
          try {
            await logAuditEvent(
              AuditLogCategory.AUTHENTICATION,
              'user_login',
              {
                login_method: 'password',
                timestamp: new Date().toISOString(),
                user_role: newSession.user.app_metadata?.role
              },
              newSession.user.id,
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

  // Set active SFD ID and store it in localStorage
  const handleSetActiveSfdId = (id: string | null) => {
    console.log('Setting active SFD ID in localStorage:', id);
    setActiveSfdId(id);
    if (id) {
      localStorage.setItem('activeSfdId', id);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  };

  // Sign in method
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

  // Sign up method
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      });
      
      if (result.error) {
        toast({
          title: "Erreur d'inscription",
          description: result.error.message || "Impossible de créer le compte",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Inscription réussie",
          description: "Votre compte a été créé avec succès",
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

  // Sign out method
  const signOut = async () => {
    try {
      console.log('AuthProvider - Signing out user');
      const userId = user?.id;
      
      toast({
        title: "Déconnexion en cours",
        description: "Veuillez patienter..."
      });
      
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
        setUser(null);
        setSession(null);
        localStorage.removeItem('activeSfdId');
        
        toast({
          title: "Déconnexion réussie",
          description: "Vous avez été déconnecté avec succès"
        });
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

  // Refresh session method
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      setSession(data.session);
      if (data.session?.user) {
        setUser({
          ...data.session.user,
          full_name: data.session.user.user_metadata?.full_name,
          avatar_url: data.session.user.user_metadata?.avatar_url,
          phone: data.session.user.user_metadata?.phone,
          sfd_id: data.session.user.user_metadata?.sfd_id,
        });
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Toggle biometric authentication
  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    // In a real implementation, you would save this preference to the user's profile
    return Promise.resolve();
  };

  // Expose authentication properties and methods via context
  const authContext: AuthContextProps = {
    user,
    session,
    loading,
    userRole,
    isAdmin: userRole === UserRole.SuperAdmin,
    isSfdAdmin: userRole === UserRole.SfdAdmin,
    isClient: userRole === UserRole.Client,
    activeSfdId,
    setActiveSfdId: handleSetActiveSfdId,
    signIn,
    signUp,
    signOut,
    refreshSession,
    biometricEnabled,
    toggleBiometricAuth,
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
};

// Export the useAuth hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
