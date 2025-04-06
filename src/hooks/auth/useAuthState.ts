
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Role } from './types';
import { createUserFromSupabaseUser } from './authUtils';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  const assignUserRole = useCallback(async (user: User) => {
    if (!user || !user.app_metadata?.role || user.app_metadata.role_assigned) return;
    
    try {
      const validRole = user.app_metadata.role as "admin" | "sfd_admin" | "user";
      
      const { data: roleData, error: roleError } = await supabase.rpc('assign_role', {
        user_id: user.id,
        role: validRole
      });
      
      if (!roleError) {
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
  }, []);

  // Load active SFD ID from localStorage
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Save active SFD ID to localStorage when it changes
  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  }, [activeSfdId]);

  // Check biometric support
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

  // Assign user role when user changes
  useEffect(() => {
    if (user) {
      assignUserRole(user);
    }
  }, [user, assignUserRole]);

  // Set up auth state listener and check initial session
  useEffect(() => {
    console.log("Setting up auth state listener and checking session");
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
      console.log("Auth state changed:", event, newSession?.user?.email);
      
      if (newSession?.user) {
        const mappedUser = createUserFromSupabaseUser(newSession.user);
        setUser(mappedUser);
      } else {
        setUser(null);
      }
      setSession(newSession);
      setLoading(false);
      
      if (newSession?.user) {
        console.log("User authenticated:", {
          email: newSession.user.email,
          role: newSession.user.app_metadata?.role
        });
      } else if (event === 'SIGNED_OUT') {
        console.log("User signed out");
      }
    });
    
    setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        console.log("Initial session check:", currentSession?.user?.email);
        
        if (currentSession) {
          setSession(currentSession);
          if (currentSession.user) {
            const mappedUser = createUserFromSupabaseUser(currentSession.user);
            setUser(mappedUser);
          }
        }
        
        setLoading(false);
      }).catch(error => {
        console.error("Error fetching initial session:", error);
        setLoading(false);
      });
    }, 0);
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const toggleBiometricAuth = async () => {
    setBiometricEnabled(prev => !prev);
  };

  const isAdmin = user?.app_metadata?.role === 'admin';
  const isSfdAdmin = user?.app_metadata?.role === 'sfd_admin';
  const userRole = user?.app_metadata?.role as Role | null;
  const isLoggedIn = !!user;

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled,
    toggleBiometricAuth,
    isAdmin,
    isSfdAdmin,
    userRole,
    isLoggedIn
  };
};
