import { useState, useEffect, useContext, createContext } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  signIn: async () => {},
  signOut: async () => {},
  isLoading: true,
});

export const useAuth = () => {
  return useContext(AuthContext);
};

// Make sure to include sfd_id in the user type
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata.full_name as string,
          avatar_url: session.user.user_metadata.avatar_url as string,
          sfd_id: session.user.user_metadata.sfd_id as string,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    fetchSession();

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email ?? '',
          full_name: session.user.user_metadata.full_name as string,
          avatar_url: session.user.user_metadata.avatar_url as string,
          sfd_id: session.user.user_metadata.sfd_id as string,
        });
      } else {
        setUser(null);
      }
    });
  }, []);

  const signIn = async (email: string) => {
    try {
      const { error } = await supabase.auth.signInWithOtp({ email });
      if (error) throw error;
      alert('Check your email for the magic link.');
    } catch (error: any) {
      alert(error.error_description || error.message);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  const value: AuthContextProps = {
    session,
    user,
    signIn,
    signOut,
    isLoading,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};
