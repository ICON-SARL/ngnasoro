
import React, { createContext, ReactNode, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextProps, User } from './types';
import { logAuthEvent } from '@/utils/audit';
import { Permission, Role, hasPermission, hasRole } from '@/utils/audit/auditPermissions';

// Create the context with a default value
const AuthContext = createContext<AuthContextProps>({
  session: null,
  user: null,
  isLoading: true,
  loading: true, // For backward compatibility
  error: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => ({ success: false }),
  updatePassword: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  hasPermission: async () => false,
  hasRole: async () => false,
  
  // SFD-related properties
  activeSfdId: null,
  setActiveSfdId: () => {},
  isAdmin: false,
  
  // Mobile-related properties
  biometricEnabled: false,
  toggleBiometricAuth: async () => {},
});

// Provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState<boolean>(false);
  
  // Derived state
  const isAdmin = Boolean(user?.role === 'super_admin' || user?.role === 'admin');

  useEffect(() => {
    // Setup auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        setSession(newSession);
        
        // Handle user data
        if (newSession?.user) {
          // Set the basic user info from the session
          setUser(newSession.user as User);
          
          // If we need to fetch additional data, do it in a setTimeout
          setTimeout(() => {
            fetchUserProfile(newSession.user.id);
          }, 0);
        } else {
          setUser(null);
        }
        
        // Log significant auth events
        if (event === 'SIGNED_IN' && newSession?.user) {
          logAuthEvent(newSession.user.id, 'login', 'success');
        } else if (event === 'SIGNED_OUT' && user) {
          logAuthEvent(user.id, 'logout', 'success');
        }
      }
    );

    // Then check for existing session
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        setSession(data?.session);
        
        if (data?.session?.user) {
          setUser(data.session.user as User);
          await fetchUserProfile(data.session.user.id);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch additional user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (rolesError) {
        throw rolesError;
      }

      // Fetch default SFD for the user
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id, is_default')
        .eq('user_id', userId);
        
      if (sfdsError) {
        console.error('Error fetching user SFDs:', sfdsError);
      }
      
      // Find default SFD or use the first one
      const defaultSfd = userSfds?.find(s => s.is_default) || userSfds?.[0];
      if (defaultSfd?.sfd_id && !activeSfdId) {
        setActiveSfdId(defaultSfd.sfd_id);
      }

      // Update user state with additional data
      setUser(prev => {
        if (!prev) return null;
        
        const roles = userRoles?.map(r => r.role) || [];
        const mainRole = roles.includes(Role.SUPER_ADMIN.toString()) 
          ? Role.SUPER_ADMIN 
          : roles.includes(Role.SFD_ADMIN.toString()) 
            ? Role.SFD_ADMIN 
            : roles.includes(Role.CLIENT.toString()) 
              ? Role.CLIENT 
              : Role.USER;
              
        return {
          ...prev,
          ...profileData,
          role: mainRole,
          sfd_id: defaultSfd?.sfd_id
        };
      });
    } catch (err) {
      console.error('Error fetching user profile:', err);
    }
  };

  // Toggle biometric authentication
  const toggleBiometricAuth = async () => {
    setBiometricEnabled(prev => !prev);
    // In a real implementation, you would store this preference in the user's profile
  };

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        if (data?.user) {
          logAuthEvent(data.user.id, 'login', 'failure', error.message);
        } else {
          logAuthEvent('unknown', 'login', 'failure', error.message);
        }
        throw error;
      }

      return { success: true };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up function
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        logAuthEvent(data.user.id, 'register', 'success');
      }
      
      return { success: true };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Log the event before signing out so we have the user ID
      if (user) {
        await logAuthEvent(user.id, 'logout', 'success');
      }
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear user state
      setUser(null);
      setSession(null);
    } catch (err) {
      setError(err as Error);
      console.error('Error signing out:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      setError(err as Error);
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update password function
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      if (user) {
        await logAuthEvent(user.id, 'password_update', 'success');
      }
      
      return { success: true };
    } catch (err) {
      setError(err as Error);
      
      if (user) {
        await logAuthEvent(user.id, 'password_update', 'failure', (err as Error).message);
      }
      
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile function
  const updateProfile = async (profile: Partial<User>) => {
    try {
      setIsLoading(true);
      
      if (!user) {
        throw new Error('No authenticated user');
      }
      
      // Update user metadata if needed
      if (profile.full_name) {
        const { error: updateUserError } = await supabase.auth.updateUser({
          data: { full_name: profile.full_name }
        });
        
        if (updateUserError) throw updateUserError;
      }
      
      // Update profile table
      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({
          full_name: profile.full_name,
          avatar_url: profile.avatar_url
        })
        .eq('id', user.id);
        
      if (updateProfileError) throw updateProfileError;
      
      // Update local user state
      setUser(prev => {
        if (!prev) return null;
        return { ...prev, ...profile };
      });
      
      await logAuthEvent(user.id, 'profile_update', 'success');
      
      return { success: true };
    } catch (err) {
      setError(err as Error);
      
      if (user) {
        await logAuthEvent(user.id, 'profile_update', 'failure', (err as Error).message);
      }
      
      return { success: false, error: err as Error };
    } finally {
      setIsLoading(false);
    }
  };

  // Higher order function to check if a user has a specific permission
  const checkPermission = async (permission: Permission) => {
    if (!user) return false;
    return hasPermission(user.id, permission);
  };

  // Higher order function to check if a user has a specific role
  const checkRole = async (role: Role) => {
    if (!user) return false;
    return hasRole(user.id, role);
  };

  // Context value
  const value: AuthContextProps = {
    session,
    user,
    isLoading,
    loading: isLoading, // For backward compatibility
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    hasPermission: checkPermission,
    hasRole: checkRole,
    activeSfdId,
    setActiveSfdId,
    isAdmin,
    biometricEnabled,
    toggleBiometricAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
