
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User, UserResponse, AuthError } from '@supabase/supabase-js';
import { Permission, UserRole } from './types';

// Define default permissions for each role
const rolePermissions: Record<UserRole, Permission[]> = {
  admin: [
    'access_mobile_app',
    'access_admin_panel',
    'manage_users',
    'manage_sfds',
    'manage_sfd_clients',
    'manage_sfd_loans',
    'approve_subsidies',
    'view_reports',
    'view_audit_logs',
    'apply_for_loans',
    'make_transfers',
    'view_transactions'
  ],
  sfd_admin: [
    'access_mobile_app',
    'access_sfd_panel',
    'manage_sfd_clients',
    'manage_sfd_loans',
    'view_sfd_subsidies',
    'view_sfd_reports',
    'apply_for_loans',
    'make_transfers',
    'view_transactions'
  ],
  user: [
    'access_mobile_app',
    'apply_for_loans',
    'make_transfers',
    'view_transactions'
  ]
};

export function useAuthProvider() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | Error | null>(null);

  // Set default SFD ID for the user
  useEffect(() => {
    if (user) {
      const fetchSfds = async () => {
        try {
          if (getUserRole() === 'sfd_admin') {
            // For SFD admins, get their assigned SFD
            const { data, error } = await supabase
              .from('user_sfds')
              .select('sfd_id, is_default')
              .eq('user_id', user.id);

            if (error) throw error;
            
            // Use the default SFD or the first one
            const defaultSfd = data.find(sfd => sfd.is_default);
            if (defaultSfd) {
              setActiveSfdId(defaultSfd.sfd_id);
            } else if (data.length > 0) {
              setActiveSfdId(data[0].sfd_id);
            }
          } else {
            // For regular users and admins, get the first active SFD
            const { data, error } = await supabase
              .from('sfds')
              .select('id')
              .eq('status', 'active')
              .limit(1);

            if (error) throw error;
            
            if (data && data.length > 0) {
              setActiveSfdId(data[0].id);
            }
          }
        } catch (error) {
          console.error('Error fetching SFDs:', error);
        }
      };

      fetchSfds();
    }
  }, [user]);

  const getUserRole = useCallback((): UserRole => {
    if (!user || !user.app_metadata) return 'user';
    return (user.app_metadata.role as UserRole) || 'user';
  }, [user]);

  // Check if user has a specific permission
  const hasPermission = useCallback(
    (permission: Permission): boolean => {
      const userRole = getUserRole();
      return rolePermissions[userRole]?.includes(permission) || false;
    },
    [getUserRole]
  );

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // First set up the auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            if (event === 'SIGNED_OUT') {
              setActiveSfdId(null);
            }
          }
        );

        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        setSession(data.session);
        setUser(data.session?.user ?? null);
        setIsLoading(false);

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err as AuthError);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error }: UserResponse = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      console.error('Sign in error:', err);
      setError(err as AuthError);
      return { user: null, session: null, error: err as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUp = async (email: string, password: string, userData?: { full_name?: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });
      
      if (error) throw error;
      
      return { user: data.user, session: data.session, error: null };
    } catch (err) {
      console.error('Sign up error:', err);
      setError(err as AuthError);
      return { user: null, session: null, error: err as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out
  const signOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (err) {
      console.error('Sign out error:', err);
      setError(err as AuthError);
      return { error: err as AuthError };
    } finally {
      setIsLoading(false);
    }
  };

  // Set active SFD
  const setActiveSfd = (sfdId: string) => {
    setActiveSfdId(sfdId);
  };

  return {
    session,
    user,
    activeSfdId,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    hasPermission,
    getUserRole,
    setActiveSfd
  };
}
