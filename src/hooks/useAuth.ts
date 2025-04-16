
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userRole: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  activeSfdId: string | null;
  setActiveSfdId: (sfdId: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Extraire le rôle de l'utilisateur depuis app_metadata
      if (session?.user) {
        const role = session.user.app_metadata?.role;
        console.log('User authenticated:', session.user.email);
        console.log('User role from metadata:', role);
        setUserRole(role || null);
      }
    });

    // Configurer le listener de changement d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Mettre à jour le rôle lors du changement d'authentification
      if (session?.user) {
        const role = session.user.app_metadata?.role;
        console.log('Auth state changed. New role:', role);
        setUserRole(role || null);
      } else {
        setUserRole(null);
      }
      
      setLoading(false);
    });

    // Récupérer le SFD actif du localStorage
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }

    return () => subscription.unsubscribe();
  }, []);

  // Fonction pour définir le SFD actif
  const updateActiveSfdId = (sfdId: string | null) => {
    console.log('Setting active SFD ID in localStorage:', sfdId);
    setActiveSfdId(sfdId);
    
    if (sfdId) {
      localStorage.setItem('activeSfdId', sfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      // Mettre à jour le rôle après connexion
      if (data.user) {
        const role = data.user.app_metadata?.role;
        console.log('Sign in successful. User role:', role);
        setUserRole(role || null);
      }
      
      return { data, error: null };
    } catch (error: any) {
      console.error('Sign in error:', error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      console.log('Signing out...');
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Réinitialiser l'état
      setUser(null);
      setSession(null);
      setUserRole(null);
      setActiveSfdId(null);
      localStorage.removeItem('activeSfdId');
      
      return { error: null };
    } catch (error: any) {
      console.error('Sign out error:', error.message);
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      userRole,
      loading,
      signIn,
      signOut,
      activeSfdId,
      setActiveSfdId: updateActiveSfdId,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
