
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { SfdData } from './types';
import { useSfdTokenManager } from './useSfdTokenManager';
import { useSfdDataFetcher } from './useSfdDataFetcher';

export function useSfdDataAccessCore() {
  const { user, activeSfdId, setActiveSfdId } = useAuth();
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const { toast } = useToast();
  
  // Use the sub-hooks
  const { loading, error, fetchUserSfds } = useSfdDataFetcher(setSfdData);
  const { getToken, refreshToken, refreshTokenIfNeeded, generateTokenForSfd } = useSfdTokenManager();

  // Fetch SFDs on component mount
  useEffect(() => {
    if (user) {
      const initializeSfds = async () => {
        await fetchUserSfds(user);
        
        // If we have SFDs but no active one is set, set the default one (or first) as active
        if (sfdData.length > 0 && !activeSfdId) {
          // Fetch is_default from the database
          const { data } = await supabase
            .from('user_sfds')
            .select('sfd_id, is_default')
            .eq('user_id', user.id);
            
          const defaultSfd = data?.find(item => item.is_default);
          if (defaultSfd) {
            setActiveSfdId(defaultSfd.sfd_id);
          } else if (sfdData[0]) {
            setActiveSfdId(sfdData[0].id);
          }
        }
      };
      
      initializeSfds();
    }
  }, [user, activeSfdId, sfdData.length, setActiveSfdId, fetchUserSfds]);

  // Switch the active SFD
  const switchActiveSfd = useCallback(async (sfdId: string) => {
    if (!user) return false;
    
    const sfd = sfdData.find(s => s.id === sfdId);
    if (!sfd) {
      toast({
        title: "Erreur",
        description: "SFD non trouvé",
        variant: "destructive",
      });
      return false;
    }
    
    setActiveSfdId(sfdId);
    
    // Ensure we have a valid token for this SFD
    await refreshTokenIfNeeded(sfdId);
    
    toast({
      title: "SFD changé",
      description: `Vous êtes maintenant connecté à ${sfd.name}`,
    });
    
    return true;
  }, [sfdData, setActiveSfdId, refreshTokenIfNeeded, user, toast]);

  // Get current active SFD data
  const getActiveSfdData = useCallback(async (): Promise<SfdData | null> => {
    if (!activeSfdId || !user) return null;
    
    const sfd = sfdData.find(s => s.id === activeSfdId);
    if (!sfd) return null;
    
    // Ensure we have a valid token
    await refreshTokenIfNeeded(activeSfdId);
    
    // Return the possibly updated SFD data
    return sfdData.find(s => s.id === activeSfdId) || null;
  }, [activeSfdId, sfdData, refreshTokenIfNeeded, user]);

  // Get the current token for API calls
  const getCurrentSfdToken = useCallback(async (): Promise<string | null> => {
    if (!activeSfdId) return null;
    
    return getToken(activeSfdId);
  }, [activeSfdId, getToken]);

  return {
    sfdData,
    loading,
    error,
    activeSfdId,
    fetchUserSfds: () => fetchUserSfds(user),
    switchActiveSfd,
    getActiveSfdData,
    getCurrentSfdToken
  };
}
