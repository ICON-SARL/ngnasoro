
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextProps, Role, SignOutResult } from './types';

const AuthContext = createContext<AuthContextProps | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);

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
          
          // Create a properly typed User object with the metadata
          const userData: User = {
            id: data.session.user.id,
            email: data.session.user.email || '',
            full_name: data.session.user.user_metadata?.full_name || '',
            app_metadata: {
              role: data.session.user.app_metadata?.role as Role || null,
              role_assigned: data.session.user.app_metadata?.role_assigned || false,
              roles: data.session.user.app_metadata?.roles || [],
              sfd_id: data.session.user.app_metadata?.sfd_id || undefined
            }
          };
          
          setUser(userData);
          
          // Check roles
          const role = data.session.user.app_metadata?.role;
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
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event);
      
      if (session) {
        // Create a properly typed User object with the metadata
        const userData: User = {
          id: session.user.id,
          email: session.user.email || '',
          full_name: session.user.user_metadata?.full_name || '',
          app_metadata: {
            role: session.user.app_metadata?.role as Role || null,
            role_assigned: session.user.app_metadata?.role_assigned || false,
            roles: session.user.app_metadata?.roles || [],
            sfd_id: session.user.app_metadata?.sfd_id || undefined
          }
        };
        
        setUser(userData);
        setSession(session);
        
        // Check roles on auth state change
        const role = session.user.app_metadata?.role;
        setIsAdmin(role === 'admin');
        setIsSfdAdmin(role === 'sfd_admin');
      } else {
        setUser(null);
        setSession(null);
        setActiveSfdId(null);
        setIsAdmin(false);
        setIsSfdAdmin(false);
      }
      
      setLoading(false);
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

  const signOut = async (): Promise<SignOutResult> => {
    console.log("AuthContext - Attempting to sign out");
    try {
      // Clear specific important local storage items first
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('adminLastSeen');
      localStorage.removeItem('sb-xnqysvnychmsockivqhb-auth-token');
      
      // Clear ALL local storage and session storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Reset all auth state immediately
      setUser(null);
      setSession(null);
      setActiveSfdId(null);
      setIsAdmin(false);
      setIsSfdAdmin(false);
      
      // Call Supabase auth signOut with global scope
      const { error } = await supabase.auth.signOut({ scope: 'global' });
      
      if (error) {
        console.error("AuthContext - Sign out error:", error);
        throw error;
      }
      
      console.log("AuthContext - Sign out successful");
      
      return { success: true };
    } catch (error: any) {
      console.error("AuthContext - Sign out error caught:", error);
      return { success: false, error: error.message || 'Une erreur est survenue lors de la déconnexion.' };
    }
  };

  const authValue: AuthContextProps = {
    user,
    session,
    loading,
    signIn,
    signOut: async () => {
      console.log("AuthContext - signOut wrapper called");
      const result = await signOut();
      if (!result.success) {
        console.error('Error signing out:', result.error);
      }
      // Hard redirect après la déconnexion pour s'assurer que l'application est complètement réinitialisée
      window.location.replace('/auth');
      return result;
    },
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    isSfdAdmin,
    setUser: (userData) => setUser(userData),
    signUp: async () => { /* Implement if needed */ },
    isLoggedIn: !!user,
    userRole: user?.app_metadata?.role || null,
    biometricEnabled: false,
    toggleBiometricAuth: async () => { /* Implement if needed */ },
    isLoading: loading,
    refreshSession: async () => { /* Implement if needed */ }
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};
