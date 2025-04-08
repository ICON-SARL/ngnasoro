
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextProps, Role, UserRole } from './types';

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [userRole, setUserRole] = useState<Role>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          return;
        }
        
        if (data?.session) {
          setSession(data.session);
          const userData = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            full_name: data.session.user.user_metadata?.full_name || '',
            avatar_url: data.session.user.user_metadata?.avatar_url,
            user_metadata: data.session.user.user_metadata || {},
            app_metadata: data.session.user.app_metadata || {}
          };
          setUser(userData);
          
          // Check roles
          const role = data.session.user.app_metadata?.role as Role;
          setUserRole(role);
          setIsAdmin(role === 'admin');
          setIsSfdAdmin(role === 'sfd_admin');
          
          // Special case - for sfd@example.com, set activeSfdId to the first SFD
          if (data.session.user.email === 'sfd@example.com' || data.session.user.email === 'sfd@test.com') {
            // Get the first SFD for this user
            const { data: sfdsData } = await supabase
              .from('user_sfds')
              .select('sfd_id')
              .eq('user_id', data.session.user.id)
              .order('created_at', { ascending: true })
              .limit(1);
              
            if (sfdsData && sfdsData.length > 0) {
              setActiveSfdId(sfdsData[0].sfd_id);
            }
          }
        }
      } catch (error) {
        console.error('Error in auth context:', error);
      } finally {
        setLoading(false);
        setIsLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      
      if (session) {
        const userData = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          avatar_url: session.user.user_metadata?.avatar_url,
          user_metadata: session.user.user_metadata || {},
          app_metadata: session.user.app_metadata || {}
        };
        setUser(userData);
        setSession(session);
        
        // Check roles on auth state change
        const role = session.user.app_metadata?.role as Role;
        setUserRole(role);
        setIsAdmin(role === 'admin');
        setIsSfdAdmin(role === 'sfd_admin');
      } else {
        setUser(null);
        setSession(null);
        setActiveSfdId(null);
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setUserRole(null);
      }
      
      setLoading(false);
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue lors de la connexion.' };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue lors de l\'inscription.' };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue lors de la déconnexion.' };
    }
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
    return Promise.resolve();
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) throw error;
      setSession(data.session);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue lors du rafraîchissement de la session.' };
    }
  };

  const isLoggedIn = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      isLoading,
      signIn,
      signUp,
      signOut,
      activeSfdId,
      setActiveSfdId,
      isAdmin,
      isSfdAdmin,
      userRole,
      biometricEnabled,
      toggleBiometricAuth,
      refreshSession,
      isLoggedIn,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
