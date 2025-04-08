
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextProps, Role } from './types';

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
          setUser({
            id: data.session.user.id,
            email: data.session.user.email,
            app_metadata: data.session.user.app_metadata
          });
          
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
        setUser({
          id: session.user.id,
          email: session.user.email,
          app_metadata: session.user.app_metadata
        });
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

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Une erreur est survenue lors de la déconnexion.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signIn,
      signOut,
      activeSfdId,
      setActiveSfdId,
      isAdmin,
      isSfdAdmin
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
