
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { SecureStorage } from '@/utils/crypto/secureStorage';
import { UserRole, Role } from './types';

// Clé pour le stockage biométrique local
const BIOMETRIC_STORAGE_KEY = 'meref_biometric_enabled';
const ENCRYPTION_KEY = process.env.VITE_ENCRYPTION_KEY || 'secure_meref_key';

const secureStorage = new SecureStorage(BIOMETRIC_STORAGE_KEY, ENCRYPTION_KEY);

export interface AuthContextProps {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  userRole: Role | null;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<Role | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

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
      } else if (user?.app_metadata?.role) {
        setUserRole(user.app_metadata.role as Role);
      } else if (user?.user_metadata?.role) {
        setUserRole(user.user_metadata.role as Role);
      } else {
        setUserRole('user');
      }
    } catch (error) {
      console.error('Error assigning role:', error);
      // Utiliser app_metadata comme fallback
      if (user?.app_metadata?.role) {
        setUserRole(user.app_metadata.role as Role);
      } else {
        setUserRole('user');
      }
    }
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
        
        if (currentSession) {
          console.log('User authenticated with metadata:', {
            email: currentSession.user.email,
            role: currentSession.user.app_metadata?.role,
            metadata: currentSession.user.app_metadata
          });
        }
        
        setSession(currentSession);
        setUser(currentSession?.user || null);
        setLoading(false);

        if (currentSession?.user) {
          console.log('User authenticated:', {
            email: currentSession.user.email,
            role: currentSession.user.app_metadata?.role
          });
          
          // Attribuer le rôle après mise à jour du user state
          setTimeout(() => {
            assignUserRole(currentSession.user.id);
          }, 0);
        } else {
          setUserRole(null);
        }
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
          console.log('User session found, logged in as:', currentSession.user.email);
          setSession(currentSession);
          setUser(currentSession.user || null);
          
          if (currentSession.user) {
            console.log('Authenticated user:', {
              id: currentSession.user.id,
              email: currentSession.user.email,
              full_name: currentSession.user.user_metadata?.full_name,
              avatar_url: currentSession.user.user_metadata?.avatar_url,
              phone: currentSession.user.phone || '',
              sfd_id: currentSession.user.user_metadata?.sfd_id,
              user_metadata: currentSession.user.user_metadata,
              app_metadata: currentSession.user.app_metadata
            });
            
            console.log('User role:', currentSession.user.app_metadata?.role);
            
            // Attribuer le rôle utilisateur
            await assignUserRole(currentSession.user.id);
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
    signOut,
    userRole,
    biometricEnabled,
    toggleBiometricAuth
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
