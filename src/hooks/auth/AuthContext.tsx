
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, AuthError } from '@supabase/supabase-js';
import { SecureStorage } from '@/utils/crypto/secureStorage';
import { UserRole, Role, User } from './types';

// Clé pour le stockage biométrique local
const BIOMETRIC_STORAGE_KEY = 'meref_biometric_enabled';
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'secure_meref_key';

const secureStorage = new SecureStorage(BIOMETRIC_STORAGE_KEY, ENCRYPTION_KEY);

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  signOut: () => Promise<void>;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);

  // Computed properties
  const isLoggedIn = !!user;
  const isAdmin = userRole === 'admin';
  const isSfdAdmin = userRole === 'sfd_admin';

  // Fonction pour attribuer le rôle utilisateur
  const assignUserRole = async (userId: string) => {
    try {
      // Utiliser une requête avec une table spécifique pour éviter l'ambiguïté
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_roles.user_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Error assigning role:', error);
        return;
      }
      
      if (data?.role) {
        setUserRole(data.role as Role);
      } else if (session?.user?.app_metadata?.role) {
        setUserRole(session.user.app_metadata.role as Role);
      } else if (session?.user?.user_metadata?.role) {
        setUserRole(session.user.user_metadata.role as Role);
      } else {
        setUserRole('user');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      // Utiliser app_metadata comme fallback
      if (session?.user?.app_metadata?.role) {
        setUserRole(session.user.app_metadata.role as Role);
      } else {
        setUserRole('user');
      }
    }
  };

  // Convert Supabase User to our custom User type
  const createUserFromSupabaseUser = (supabaseUser: any): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: supabaseUser.user_metadata?.full_name || '',
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      phone: supabaseUser.phone,
      sfd_id: supabaseUser.user_metadata?.sfd_id || supabaseUser.app_metadata?.sfd_id,
      user_metadata: {
        ...supabaseUser.user_metadata
      },
      app_metadata: {
        ...supabaseUser.app_metadata,
        role: supabaseUser.app_metadata?.role || 
              (supabaseUser.user_metadata?.role === 'sfd_admin' ? 'sfd_admin' : undefined) ||
              (supabaseUser.user_metadata?.sfd_id ? 'sfd_admin' : undefined)
      }
    };
  };

  useEffect(() => {
    // Vérifier si l'authentification biométrique est activée
    const checkBiometricSettings = () => {
      const storedSettings = secureStorage.getItem<{ enabled: boolean }>();
      setBiometricEnabled(!!storedSettings?.enabled);
    };

    checkBiometricSettings();
  }, []);

  useEffect(() => {
    console.log('Setting up auth state listener and checking session');
    
    // Configurer l'écouteur d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Auth state changed:', event, currentSession?.user?.email);
        
        setSession(currentSession);
        
        if (currentSession?.user) {
          const customUser = createUserFromSupabaseUser(currentSession.user);
          setUser(customUser);
          
          console.log('User authenticated with metadata:', {
            email: customUser.email,
            role: customUser.app_metadata?.role,
            metadata: customUser.app_metadata
          });
          
          // Attribuer le rôle après mise à jour du user state
          setTimeout(() => {
            assignUserRole(customUser.id);
          }, 0);
        } else {
          setUser(null);
          setUserRole(null);
        }
        
        setLoading(false);
      }
    );

    // Vérifier la session existante
    const checkCurrentSession = async () => {
      try {
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Error checking session:', sessionError);
          setLoading(false);
          return;
        }
        
        if (currentSession) {
          setSession(currentSession);
          
          if (currentSession.user) {
            const customUser = createUserFromSupabaseUser(currentSession.user);
            setUser(customUser);
            
            console.log('Authenticated user:', {
              id: customUser.id,
              email: customUser.email,
              full_name: customUser.full_name,
              avatar_url: customUser.avatar_url,
              phone: customUser.phone || '',
              sfd_id: customUser.sfd_id,
              user_metadata: customUser.user_metadata,
              app_metadata: customUser.app_metadata
            });
            
            // Attribuer le rôle utilisateur
            await assignUserRole(customUser.id);
          }
        }
      } catch (error) {
        console.error('Unexpected error checking session:', error);
      } finally {
        setLoading(false);
      }
    };

    checkCurrentSession();

    // Nettoyer l'écouteur
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Connexion utilisateur
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        console.error('Login error:', error);
        setError(error.message);
        return { error };
      }

      return { error: null };
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('Une erreur inattendue est survenue lors de la connexion');
      return { error: err as AuthError };
    } finally {
      setLoading(false);
    }
  };

  // Sign up new user
  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        setError(error.message);
        console.error('Signup error:', error);
      }
    } catch (err) {
      setError('Une erreur inattendue est survenue lors de l\'inscription');
      console.error('Unexpected signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion utilisateur
  const signOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Pas besoin de réinitialiser user et session car onAuthStateChange le fera
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Refresh the session
  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return;
      }
      
      setSession(data.session);
      if (data.session?.user) {
        const customUser = createUserFromSupabaseUser(data.session.user);
        setUser(customUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  // Activer/désactiver l'authentification biométrique
  const toggleBiometricAuth = async () => {
    const newState = !biometricEnabled;
    
    // Mettre à jour le stockage local sécurisé
    secureStorage.setItem({ enabled: newState });
    setBiometricEnabled(newState);
    
    return Promise.resolve();
  };

  const value = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    userRole,
    biometricEnabled,
    toggleBiometricAuth,
    isLoggedIn,
    isAdmin,
    isSfdAdmin,
    activeSfdId,
    setActiveSfdId,
    refreshSession
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
