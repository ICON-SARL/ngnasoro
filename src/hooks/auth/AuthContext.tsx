import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, UserRole } from './types';

const AuthContext = createContext<AuthContextProps>({
  user: null,
  loading: true,
  session: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  refreshSession: async () => {},
  activeSfdId: null,
  setActiveSfdId: () => {},
  isAdmin: false,
  isSfdAdmin: false,
  userRole: UserRole.User,
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    
    // Get session from local storage on initial load
    const savedSession = localStorage.getItem('supabase.auth.token');
    if (savedSession) {
      const { currentSession } = JSON.parse(savedSession);
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
      }
    }
    
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);
      
      // If the user logged in and is an SFD admin, check for default SFD
      if (event === 'SIGNED_IN' && session?.user) {
        const userRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
        
        if (userRole === 'sfd_admin') {
          await loadDefaultSfd(session.user.id);
        }
      }
    });
    
    // Initial session check
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session);
        
        // If user is logged in and is an SFD admin, check for default SFD
        if (session?.user) {
          const userRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
          
          if (userRole === 'sfd_admin') {
            await loadDefaultSfd(session.user.id);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };
    
    initializeAuth();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const loadDefaultSfd = async (userId: string) => {
    try {
      // Get user's default SFD
      const { data, error } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', userId)
        .eq('is_default', true)
        .single();
      
      if (error) {
        if (error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
          console.error('Error fetching default SFD:', error);
        }
        
        // If no default SFD, try to get any SFD
        const { data: anySfd, error: anySfdError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', userId)
          .limit(1)
          .single();
        
        if (anySfdError) {
          console.error('Error fetching any SFD:', anySfdError);
          return;
        }
        
        if (anySfd) {
          console.log('Setting active SFD ID from any SFD:', anySfd.sfd_id);
          setActiveSfdId(anySfd.sfd_id);
          
          // Set it as default for next time
          const { error: updateError } = await supabase
            .from('user_sfds')
            .update({ is_default: true })
            .eq('user_id', userId)
            .eq('sfd_id', anySfd.sfd_id);
          
          if (updateError) {
            console.error('Error setting default SFD:', updateError);
          }
        }
      } else if (data) {
        console.log('Setting active SFD ID from default SFD:', data.sfd_id);
        setActiveSfdId(data.sfd_id);
      }
    } catch (error) {
      console.error('Error in loadDefaultSfd:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }

      // Check if the user is an SFD admin and load their default SFD
      const userRole = data.user?.app_metadata?.role || data.user?.user_metadata?.role;
      
      if (userRole === 'sfd_admin' && data.user) {
        await loadDefaultSfd(data.user.id);
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign in error:', error);
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
        return { error };
      }
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign up error:', error);
      return { error };
    }
  };

  const signOut = async () => {
    try {
      console.log("Démarrage du processus de déconnexion...");
      
      // Nettoyage des données locales avant déconnexion
      localStorage.removeItem('sb-xnqysvnychmsockivqhb-auth-token');
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('activeSfdId');
      
      // Déconnexion Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion Supabase:', error);
        throw error;
      }
      
      console.log("Déconnexion Supabase réussie");
      
      // Mise à jour de l'état de l'application
      setUser(null);
      setSession(null);
      setActiveSfdId(null);
      
      console.log("État d'authentification réinitialisé");
      return { success: true };
    } catch (error) {
      console.error('Erreur complète lors de la déconnexion:', error);
      return { success: false, error };
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSession(session);
      
      if (session?.user) {
        const userRole = session.user.app_metadata?.role || session.user.user_metadata?.role;
        
        if (userRole === 'sfd_admin') {
          await loadDefaultSfd(session.user.id);
        }
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  const toggleBiometricAuth = async () => {
    // Implementation would connect to device biometrics
    // For now, just toggle the state
    setBiometricEnabled(!biometricEnabled);
    return Promise.resolve();
  };

  // Determine user role based on metadata
  const getUserRole = (): UserRole => {
    if (!user) return UserRole.User;
    
    const roleString = user.app_metadata?.role || user.user_metadata?.role;
    
    if (roleString === 'admin') return UserRole.SuperAdmin;
    if (roleString === 'sfd_admin') return UserRole.SfdAdmin;
    return UserRole.User;
  };

  const userRole = getUserRole();
  const isAdmin = userRole === UserRole.SuperAdmin;
  const isSfdAdmin = userRole === UserRole.SfdAdmin;

  const value = {
    user: user as any, // Type assertion to match our extended User interface
    loading,
    session,
    signIn,
    signUp,
    signOut,
    refreshSession,
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    isSfdAdmin,
    userRole,
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
