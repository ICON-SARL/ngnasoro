
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { useToast } from './use-toast';

export type UserRole = 'user' | 'admin' | 'super_admin' | 'sfd_admin';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  isSuperAdmin: boolean;
  activeSfdId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  setActiveSFD: (sfdId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      
      if (newSession?.user) {
        // Check user role
        const userRole = newSession?.user?.app_metadata?.role || 'user';
        setIsAdmin(userRole === 'admin' || userRole === 'super_admin' || userRole === 'sfd_admin');
        setIsSfdAdmin(userRole === 'sfd_admin');
        setIsSuperAdmin(userRole === 'super_admin');

        // For SFD admin, get the SFD ID
        if (userRole === 'sfd_admin') {
          const sfdId = newSession?.user?.user_metadata?.sfd_id;
          if (sfdId) {
            setActiveSfdId(sfdId);
          }
        }
      } else {
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setIsSuperAdmin(false);
        setActiveSfdId(null);
      }
    });

    // Get initial session
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          const userRole = session?.user?.app_metadata?.role || 'user';
          setIsAdmin(userRole === 'admin' || userRole === 'super_admin' || userRole === 'sfd_admin');
          setIsSfdAdmin(userRole === 'sfd_admin');
          setIsSuperAdmin(userRole === 'super_admin');

          // For SFD admin, get the SFD ID
          if (userRole === 'sfd_admin') {
            const sfdId = session?.user?.user_metadata?.sfd_id;
            if (sfdId) {
              setActiveSfdId(sfdId);
            }
          }
        }
      } catch (error) {
        console.error('Error retrieving session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur d'authentification",
        description: error.message || "Une erreur est survenue lors de la connexion",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur lors de l'inscription",
        description: error.message || "Une erreur est survenue lors de l'inscription",
        variant: "destructive",
      });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error: any) {
      toast({
        title: "Erreur de déconnexion",
        description: error.message || "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
      throw error;
    }
  };

  const setActiveSFD = (sfdId: string) => {
    setActiveSfdId(sfdId);
  };

  const value = {
    user,
    session,
    isLoading,
    isAdmin,
    isSfdAdmin,
    isSuperAdmin,
    activeSfdId,
    signIn,
    signUp,
    signOut,
    setActiveSFD,
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
