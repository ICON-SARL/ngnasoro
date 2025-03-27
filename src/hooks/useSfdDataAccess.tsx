
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { 
  generateSfdContextToken, 
  refreshSfdContextToken, 
  shouldRefreshSfdToken 
} from '@/utils/sfdJwtContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SfdData {
  id: string;
  name: string;
  token: string | null;
  lastFetched: Date | null;
}

export function useSfdDataAccess() {
  const { user, activeSfdId, setActiveSfdId } = useAuth();
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch available SFDs for the current user
  const fetchUserSfds = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch SFDs from the database using the user_sfds join table
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id(id, name, code, region)
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        const sfdList: SfdData[] = data.map(item => ({
          id: item.sfds.id,
          name: item.sfds.name,
          token: null,
          lastFetched: null
        }));
        
        setSfdData(sfdList);
        
        // If we have SFDs but no active one is set, set the default one (or first) as active
        if (sfdList.length > 0 && !activeSfdId) {
          const defaultSfd = data.find(item => item.is_default);
          if (defaultSfd) {
            setActiveSfdId(defaultSfd.sfds.id);
          } else {
            setActiveSfdId(sfdList[0].id);
          }
        }
      }
    } catch (err: any) {
      console.error('Error fetching SFDs:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer vos SFDs",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, activeSfdId, setActiveSfdId, toast]);

  // Generate a new token for a specific SFD
  const generateTokenForSfd = useCallback(async (sfdId: string): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const token = await generateSfdContextToken(user.id, sfdId);
      
      // Update the token in our state
      setSfdData(prev => prev.map(sfd => 
        sfd.id === sfdId 
          ? { ...sfd, token, lastFetched: new Date() } 
          : sfd
      ));
      
      return token;
    } catch (error) {
      console.error('Error generating token:', error);
      return null;
    }
  }, [user]);

  // Refresh a token if needed
  const refreshTokenIfNeeded = useCallback(async (sfdId: string): Promise<string | null> => {
    const sfd = sfdData.find(s => s.id === sfdId);
    if (!sfd || !sfd.token) {
      return generateTokenForSfd(sfdId);
    }
    
    try {
      // Check if token needs refresh
      const needsRefresh = await shouldRefreshSfdToken(sfd.token);
      
      if (needsRefresh) {
        // Token needs refresh, get a new one
        const refreshedToken = await refreshSfdContextToken(sfd.token);
        
        if (refreshedToken) {
          // Update token in state
          setSfdData(prev => prev.map(s => 
            s.id === sfdId 
              ? { ...s, token: refreshedToken, lastFetched: new Date() } 
              : s
          ));
          
          return refreshedToken;
        } else {
          // If refresh failed, generate a new token
          return generateTokenForSfd(sfdId);
        }
      }
      
      // Token is still valid
      return sfd.token;
    } catch (error) {
      console.error('Error refreshing token:', error);
      return generateTokenForSfd(sfdId);
    }
  }, [sfdData, generateTokenForSfd]);

  // Switch the active SFD
  const switchActiveSfd = useCallback(async (sfdId: string) => {
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
  }, [sfdData, setActiveSfdId, refreshTokenIfNeeded, toast]);

  // Get current active SFD data
  const getActiveSfdData = useCallback(async (): Promise<SfdData | null> => {
    if (!activeSfdId) return null;
    
    const sfd = sfdData.find(s => s.id === activeSfdId);
    if (!sfd) return null;
    
    // Ensure we have a valid token
    await refreshTokenIfNeeded(activeSfdId);
    
    // Return the possibly updated SFD data
    return sfdData.find(s => s.id === activeSfdId) || null;
  }, [activeSfdId, sfdData, refreshTokenIfNeeded]);

  // Get the current token for API calls
  const getCurrentSfdToken = useCallback(async (): Promise<string | null> => {
    if (!activeSfdId) return null;
    
    return refreshTokenIfNeeded(activeSfdId);
  }, [activeSfdId, refreshTokenIfNeeded]);

  // Load SFDs on component mount
  useEffect(() => {
    if (user) {
      fetchUserSfds();
    }
  }, [user, fetchUserSfds]);

  return {
    sfdData,
    loading,
    error,
    activeSfdId,
    fetchUserSfds,
    switchActiveSfd,
    getActiveSfdData,
    getCurrentSfdToken
  };
}
