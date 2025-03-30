import { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextProps, Role } from './types';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface AuthContextType extends AuthContextProps { }

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => { },
  signIn: async () => ({}),
  signUp: async () => { },
  signOut: async () => { },
  loading: true,
  isLoggedIn: false,
  isAdmin: false,
  isSfdAdmin: false,
  activeSfdId: null,
  setActiveSfdId: () => { },
  userRole: null,
  biometricEnabled: false,
  toggleBiometricAuth: async () => { },
  session: null,
  isLoading: false,
  refreshSession: async () => { }
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const navigate = useNavigate();
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }
  }, []);

  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  }, [activeSfdId]);

  useEffect(() => {
    const checkBiometricSupport = async () => {
      if (typeof window !== 'undefined' && 'PublicKeyCredential' in window) {
        try {
          const isConditionalMediationAvailable = await (window.PublicKeyCredential as any).isConditionalMediationAvailable();
          setBiometricEnabled(!!isConditionalMediationAvailable);
        } catch (error) {
          console.error("Error checking biometric support:", error);
          setBiometricEnabled(false);
        }
      } else {
        setBiometricEnabled(false);
      }
    };

    checkBiometricSupport();
  }, []);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN') {
        if (session && session.user) {
          setUser(session.user);
          setSession(session);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setSession(null);
      }
    });
  }, []);

  useEffect(() => {
    // You need to fix the user session handling in getSession
    supabase.auth.getSession().then(({ data }) => {
      if (data && data.session) {
        setSession(data.session);
        setUser(data.session.user as User);
        setLoading(false);
      } else {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        console.error('Sign in error:', error);
        return { error };
      }
      if (data.session) {
        setUser(data.session.user);
        setSession(data.session);
      }
      return {};
    } catch (error) {
      console.error('Unexpected sign in error:', error);
      return { error: error };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: Record<string, any> = {}) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) {
        console.error('Sign up error:', error);
        throw error;
      }
      if (data.session) {
        setUser(data.session.user);
        setSession(data.session);
      }
    } catch (error) {
      console.error('Unexpected sign up error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      setUser(null);
      setSession(null);
      navigate('/auth');
    } catch (error) {
      console.error('Unexpected sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const refreshSession = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.refreshSession()
      
      if (error) {
        console.error('refreshSession error:', error);
      }
      
      if (data?.session) {
        setSession(data.session);
        setUser(data.session.user);
      }
    } catch (error) {
      console.error('Unexpected refreshSession error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(prev => !prev);
  };

  const isAdmin = user?.app_metadata?.role === 'admin';
  const isSfdAdmin = user?.app_metadata?.role === 'sfd_admin';
  const userRole = user?.app_metadata?.role as Role | null;

  // Fix the assign_role call to properly cast the role value
  const storedRole = user?.app_metadata?.role;
  if (storedRole && !user.app_metadata.role_assigned) {
    // Cast the string role to the expected literal type
    const validRole = storedRole as "admin" | "sfd_admin" | "user";
    
    try {
      const { data: roleData, error: roleError } = await supabase.rpc('assign_role', {
        user_id: user.id,
        role: validRole // Now properly typed
      });
      
      if (!roleError) {
        // Update user metadata to mark role as assigned
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            ...user.app_metadata,
            role_assigned: true
          }
        });
        
        if (updateError) {
          console.error('Error updating user metadata:', updateError);
        }
      } else {
        console.error('Error assigning role:', roleError);
      }
    } catch (err) {
      console.error('Error in assign_role process:', err);
    }
  }

  const value: AuthContextType = {
    user,
    setUser,
    signIn,
    signUp,
    signOut,
    loading,
    isLoggedIn: !!user,
    isAdmin,
    isSfdAdmin,
    activeSfdId,
    setActiveSfdId,
    userRole,
    biometricEnabled,
    toggleBiometricAuth,
    session,
    isLoading,
    refreshSession
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
