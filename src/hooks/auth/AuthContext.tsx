import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextProps, Role } from './types';
import { useToast } from '@/hooks/use-toast';
import { AuditLogCategory, AuditLogSeverity } from '@/utils/audit/auditLoggerTypes';
import { logAuditEvent } from '@/utils/audit/auditLoggerCore';

const defaultContext: AuthContextProps = {
  user: null,
  setUser: () => {},
  signIn: async () => {},
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

const AuthContext = createContext<AuthContextProps>(defaultContext);

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

  const signIn = async (email: string, password: string): Promise<void> => {
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
        await checkUserRole(data.user.id);
      }

      toast({
        title: 'Connexion réussie',
        description: 'Vous êtes maintenant connecté.',
      });
    } catch (error: any) {
      console.error('Sign-in error:', error);
      toast({
        title: 'Erreur de connexion',
        description: error.message || 'Identifiants incorrects.',
        variant: 'destructive',
      });
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
          setUser(session.user);
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
        setUser(user);
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
        setUserRole(roleValue);
        return roleValue;
      }

      // Default role if none found
      setUserRole(Role.USER);
      return Role.USER;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole(null);
      return null;
    }
  };

  // Biometric auth toggle
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
