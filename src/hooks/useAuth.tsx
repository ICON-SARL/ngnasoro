
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { createClient } from '@supabase/supabase-js';
import { User, Session } from '@supabase/supabase-js';

export interface AuthUser extends User {
  full_name?: string;
  avatar_url?: string;
  sfd_id?: string;
  phone?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: Session | null;
  isAdmin: boolean;
  isSfdAdmin: boolean;
  activeSfdId: string | null;
  isLoading: boolean;
  loading: boolean;
  userRole: string | null;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error?: any }>;
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  setActiveSfdId: (sfdId: string | null) => void;
  biometricEnabled: boolean;
  toggleBiometricAuth: () => Promise<void>;
  refreshSession: () => Promise<void>;
  isLoggedIn: boolean;
  setUser: (user: AuthUser | null) => void;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSfdAdmin, setIsSfdAdmin] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session?.user) {
      const authUser = session.user as AuthUser;
      
      // Extract metadata
      if (session.user.user_metadata) {
        authUser.full_name = session.user.user_metadata.full_name;
        authUser.phone = session.user.user_metadata.phone;
      }
      
      // Set the user
      setUser(authUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
    return session;
  }, []);

  useEffect(() => {
    fetchSession();

    supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const authUser = session.user as AuthUser;
        
        // Extract metadata
        if (session.user.user_metadata) {
          authUser.full_name = session.user.user_metadata.full_name;
          authUser.phone = session.user.user_metadata.phone;
        }
        
        setUser(authUser);
      } else {
        setUser(null);
      }
      setSession(session);
    });
  }, [fetchSession]);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user) {
        try {
          // Check if this user is an admin using admin_users table
          const { data: adminData, error: adminError } = await supabase
            .from('admin_users')
            .select('*')
            .eq('user_id', user.id)
            .single();

          if (adminData && !adminError) {
            setIsAdmin(true);
            setUserRole('admin');
            return;
          }
          
          // Check if this user is an SFD admin
          const { data: sfdAdminData, error: sfdAdminError } = await supabase
            .from('sfd_admins')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (sfdAdminData && !sfdAdminError) {
            setIsSfdAdmin(true);
            setUserRole('sfd_admin');
            return;
          }
          
          // Default user role
          setUserRole('user');
          setIsAdmin(false);
          setIsSfdAdmin(false);
          
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
          setIsSfdAdmin(false);
          setUserRole('user');
        }
      } else {
        setIsAdmin(false);
        setIsSfdAdmin(false);
        setUserRole(null);
      }
    };

    checkAdminStatus();
  }, [user]);

  // Get a valid SFD ID 
  const getValidSfdId = async () => {
    if (!user) return null;
    
    try {
      // Retrieve the first SFD available for the user
      const { data, error } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      
      if (error) {
        console.error('Error fetching user SFD:', error);
        return null;
      }
      
      return data?.sfd_id || null;
    } catch (e) {
      console.error('Exception when fetching user SFD:', e);
      return null;
    }
  };

  // Use this function in an appropriate useEffect
  useEffect(() => {
    if (user && !activeSfdId) {
      getValidSfdId().then(id => {
        if (id) setActiveSfdId(id);
      });
    }
  }, [user, activeSfdId]);

  // Required auth methods for compatibility
  const signIn = async (email: string, password: string): Promise<{ error?: any }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error };
      return {};
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, metadata?: Record<string, any>) => {
    await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: metadata
      }
    });
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const refreshSession = async () => {
    await fetchSession();
  };

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(!biometricEnabled);
  };

  return { 
    user, 
    session, 
    isAdmin,
    isSfdAdmin,
    activeSfdId, 
    isLoading,
    loading: isLoading,
    userRole,
    signOut,
    signIn,
    signUp,
    setActiveSfdId,
    biometricEnabled,
    toggleBiometricAuth,
    refreshSession,
    isLoggedIn: !!user,
    setUser
  };
}
