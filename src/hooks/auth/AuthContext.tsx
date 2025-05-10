
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { UserRole, AuthContextProps, User as CustomUser } from './types';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>('user');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check for existing session first
    const checkSession = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          const userData = currentSession.user as CustomUser;
          setUser(userData);

          // Déterminer le rôle de l'utilisateur
          const role = userData.app_metadata?.role || 'user';
          setUserRole(role);
          
          // Définir les booléens de rôle
          setIsAdmin(role === 'admin' || role === 'super_admin');
          setIsSfdAdmin(role === 'sfd_admin');
          setIsClient(role === 'client');
          
          // Rechercher les informations de rôle dans user_roles si nécessaire
          fetchUserRoles(userData.id);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch additional user roles from the database
    const fetchUserRoles = async (userId: string) => {
      try {
        // Vérifier dans la table user_roles
        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId);

        if (error) {
          console.error('Error fetching user roles:', error);
          return;
        }

        if (userRoles && userRoles.length > 0) {
          // Si nous avons des rôles dans la base de données, ils ont priorité
          const dbRoles = userRoles.map(r => r.role);
          
          // Mettre à jour les drapeaux de rôle
          const isAdminRole = dbRoles.includes('admin') || dbRoles.includes('super_admin');
          const isSfdAdminRole = dbRoles.includes('sfd_admin');
          const isClientRole = dbRoles.includes('client');
          
          setIsAdmin(isAdminRole);
          setIsSfdAdmin(isSfdAdminRole);
          setIsClient(isClientRole);
          
          // Mettre à jour le rôle principal (pour la compatibilité)
          if (isClientRole) setUserRole('client');
          else if (isSfdAdminRole) setUserRole('sfd_admin');
          else if (isAdminRole) setUserRole('admin');
        }
      } catch (error) {
        console.error('Error in fetchUserRoles:', error);
      }
    };

    // Set up auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log('Auth state changed:', event);
      setSession(newSession);

      if (event === 'SIGNED_IN' && newSession) {
        const userData = newSession.user as CustomUser;
        setUser(userData);
        
        // Determine user role from metadata
        const role = userData.app_metadata?.role || 'user';
        setUserRole(role);
        
        // Set role boolean flags
        setIsAdmin(role === 'admin' || role === 'super_admin');
        setIsSfdAdmin(role === 'sfd_admin');
        setIsClient(role === 'client');
        
        // Check database for additional role info
        setTimeout(() => {
          fetchUserRoles(userData.id);
        }, 0);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserRole('user');
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setIsClient(false);
        setActiveSfdId(null);
      }
    });

    // Initial session check
    checkSession();

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      // Nettoyer tout état d'authentification précédent
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      // Nettoyer tout état d'authentification précédent
      cleanupAuthState();
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata
        }
      });
      
      if (error) throw error;
      return { data };
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast({
        title: "Erreur d'inscription",
        description: error.message || "Impossible de créer un compte",
        variant: "destructive",
      });
      return { error };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      // Clean up local storage auth state
      cleanupAuthState();
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error };
    }
  };

  // Refresh session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        throw error;
      }
      
      setSession(data.session);
      if (data.session) {
        setUser(data.session.user as CustomUser);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Toggle biometric authentication
  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    return Promise.resolve();
  };

  // Clean up auth state in storage
  const cleanupAuthState = () => {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    // Remove from sessionStorage if in use
    Object.keys(sessionStorage || {}).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
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
    activeSfdId,
    setActiveSfdId,
    signIn,
    signUp,
    signOut,
    refreshSession,
    biometricEnabled,
    toggleBiometricAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
