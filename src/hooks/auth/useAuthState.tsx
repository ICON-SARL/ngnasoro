
import { useState, useEffect } from 'react';
import { User } from './types';
import { supabase } from '@/integrations/supabase/client';

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);

  // Fetch active SFD when user changes
  useEffect(() => {
    if (!user) {
      setActiveSfdId(null);
      return;
    }

    const fetchActiveSfd = async () => {
      try {
        const { data, error } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .single();

        if (error) {
          console.error('Error fetching active SFD:', error);
          return;
        }

        if (data) {
          setActiveSfdId(data.sfd_id);
        }
      } catch (err) {
        console.error('Unexpected error fetching active SFD:', err);
      }
    };

    fetchActiveSfd();
  }, [user]);

  return {
    user,
    setUser,
    session,
    setSession,
    loading,
    setLoading,
    activeSfdId,
    setActiveSfdId,
    biometricEnabled,
    setBiometricEnabled
  };
}
