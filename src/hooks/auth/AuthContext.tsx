import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextProps, Role } from './types';
import { useToast } from '@/hooks/use-toast';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';

const convertSupabaseUser = (supabaseUser: any): User => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || '',
    full_name: supabaseUser.user_metadata?.full_name,
    avatar_url: supabaseUser.user_metadata?.avatar_url,
    sfd_id: supabaseUser.user_metadata?.sfd_id,
    phone: supabaseUser.user_metadata?.phone,
    aud: supabaseUser.aud,
    created_at: supabaseUser.created_at,
    app_metadata: supabaseUser.app_metadata || {},
    user_metadata: supabaseUser.user_metadata || {}
  };
};

const defaultContext: AuthContextProps = {
  user: null,
  setUser: () => {},
  signIn: async () => ({}),
  signUp: async () => {},
  signOut: async () => {},
  loading: true,
  isLoggedIn: false,
  isAdmin: false,
  isSfdAdmin: false,
  activeSfdId: null,
  setActiveSfdId: () => {},
  userRole: null,
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
};

export const AuthContext = createContext<AuthContextProps>(defaultContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { toast } = useToast();

  const isLoggedIn = !!user;
  const isAdmin = userRole === Role.SUPER_ADMIN;
  const isSfdAdmin = userRole === Role.SFD_ADMIN;

  const signIn = async (email: string, password: string): Promise<{ error?: any } | undefined> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Convert Supabase user to our User type
        setUser(convertSupabaseUser(data.user));
        
        console.log('Signin successful - User data:', {
          id: data.user.id,
          email: data.user.email,
          role: data.user.app_metadata?.role,
          metadata: data.user.app_metadata,
        });
        
        await checkUserRole(data.user.id);
      }

      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté.',
      });
      
      return undefined; // Return undefined when no error
    } catch (error: any) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Identifiants incorrects.',
        variant: 'destructive',
      });
      
      return { error }; // Return the error
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>): Promise<void> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        // Convert Supabase user to our User type
        setUser(convertSupabaseUser(data.user));
        await checkUserRole(data.user.id);
      }

      toast({
        title: 'Inscription réussie',
        description: 'Veuillez confirmer votre adresse e-mail.',
      });
    } catch (error: any) {
      console.error('Sign-up error:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Impossible d'enregistrer l'utilisateur.",
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      setUser(null);
      setUserRole(null);
      setActiveSfdId(null);

      toast({
        title: 'Déconnexion réussie',
        description: 'Vous êtes maintenant déconnecté.',
      });
    } catch (error: any) {
      console.error('Sign-out error:', error);
      toast({
        title: 'Erreur de déconnexion',
        description: error.message || 'Impossible de vous déconnecter.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setLoading(true);
        if (session?.user) {
          // Convert Supabase user to our User type
          setUser(convertSupabaseUser(session.user));
          await checkUserRole(session.user.id);
        } else {
          setUser(null);
          setUserRole(null);
          setActiveSfdId(null);
        }
        setLoading(false);
      }
    );

    // Initial load
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Convert Supabase user to our User type
        setUser(convertSupabaseUser(user));
        await checkUserRole(user.id);
      }
      setLoading(false);
    })();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;

      if (data && data.length > 0) {
        // Map the role string to our Role enum
        const roleValue = data[0].role as Role;
        console.log('Role found in database for user', userId, ':', roleValue);
        setUserRole(roleValue);
        return roleValue;
      }

      // If no role found in user_roles table, check app_metadata
      console.log('No role found in user_roles table, checking app_metadata...');
      const { data: userData } = await supabase.auth.getUser();
      if (userData && userData.user && userData.user.app_metadata?.role) {
        const appMetadataRole = userData.user.app_metadata.role as Role;
        console.log('Role found in app_metadata:', appMetadataRole);
        
        // Save the role to user_roles table for consistency
        try {
          await supabase.rpc('assign_role', {
            user_id: userId,
            role: appMetadataRole
          });
          console.log('Role saved to user_roles table');
        } catch (err) {
          console.error('Error saving role to user_roles table:', err);
        }
        
        setUserRole(appMetadataRole);
        return appMetadataRole;
      }

      // Default role if none found
      console.log('No role found, defaulting to USER role');
      setUserRole(Role.USER);
      return Role.USER;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      return null;
    }
  };

  const toggleBiometricAuth = async (): Promise<void> => {
    try {
      setBiometricEnabled(prev => !prev);
      
      // In a real app, you would store this preference in the database
      await logAuditEvent({
        user_id: user?.id || 'unknown',
        action: biometricEnabled ? 'disable_biometric_auth' : 'enable_biometric_auth',
        category: AuditLogCategory.AUTHENTICATION,
        severity: AuditLogSeverity.INFO,
        status: 'success',
        details: {
          enabled: !biometricEnabled
        }
      });
      
    } catch (error) {
      console.error('Error toggling biometric auth:', error);
      setBiometricEnabled(prev => prev); // Revert to previous state
      throw error;
    }
  };

  const value: AuthContextProps = {
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    loading,
    isLoggedIn,
    isAdmin,
    isSfdAdmin,
    activeSfdId,
    setActiveSfdId,
    userRole,
    biometricEnabled,
    toggleBiometricAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
