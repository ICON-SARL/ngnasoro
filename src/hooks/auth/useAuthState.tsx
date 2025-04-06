
import { useState, useEffect, useCallback } from 'react';
import { User } from './types';
import { supabase } from '@/integrations/supabase/client';
import { createUserFromSupabaseUser } from './authUtils';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Assign user role if needed
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

  // Effect to load active SFD ID from localStorage
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Effect to save active SFD ID to localStorage
  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  }, [activeSfdId]);

  // Effect to check biometric support
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

  // Assign role when user changes
  useEffect(() => {
    if (user) {
      assignUserRole(user);
    }
  }, [user, assignUserRole]);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    isLoading,
    setIsLoading,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled,
    setBiometricEnabled
  };
}
