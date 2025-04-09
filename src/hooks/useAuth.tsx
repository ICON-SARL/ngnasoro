
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { UserRole } from '@/utils/auth/roleTypes';
import { useSfdDataAccessCore } from './sfd/useSfdDataAccessCore';

interface AuthContextType {
  user: User | null;
  userRole: UserRole | null;
  isSfdAdmin: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  activeSfdId: string | null;
  setActiveSfdId: (id: string | null) => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userRole: null,
  isSfdAdmin: false,
  isAdmin: false,
  isSuperAdmin: false,
  activeSfdId: null,
  setActiveSfdId: () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const { 
    activeSfdId, 
    setActiveSfdId,
    sfdData
  } = useSfdDataAccessCore();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setUser(session.user);
        const role = session.user?.app_metadata?.role;
        setUserRole(role ? role as UserRole : UserRole.USER);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          setUser(session.user);
          const role = session.user?.app_metadata?.role;
          setUserRole(role ? role as UserRole : UserRole.USER);
        } else {
          setUser(null);
          setUserRole(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isSfdAdmin = userRole === UserRole.SFD_ADMIN;
  const isAdmin = userRole === UserRole.ADMIN;
  const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

  const value = {
    user,
    userRole,
    isSfdAdmin,
    isAdmin,
    isSuperAdmin,
    activeSfdId,
    setActiveSfdId,
    signOut
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
