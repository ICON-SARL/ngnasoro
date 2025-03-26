
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { generateSfdContextToken } from '@/utils/sfdJwtContext';
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
      
      // For this example, we'll use mock data
      // In a real app, this would fetch from a 'user_sfds' table
      const mockSfdData: SfdData[] = [
        { id: 'sfd1', name: 'Premier SFD', token: null, lastFetched: null },
        { id: 'sfd2', name: 'Deuxième SFD', token: null, lastFetched: null },
        { id: 'sfd3', name: 'Troisième SFD', token: null, lastFetched: null }
      ];
      
      setSfdData(mockSfdData);
      
      // If we have SFDs but no active one is set, set the first one as active
      if (mockSfdData.length > 0 && !activeSfdId) {
        setActiveSfdId(mockSfdData[0].id);
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
  const generateTokenForSfd = useCallback((sfdId: string): string | null => {
    if (!user) return null;
    
    const token = generateSfdContextToken(user.id, sfdId);
    
    // Update the token in our state
    setSfdData(prev => prev.map(sfd => 
      sfd.id === sfdId 
        ? { ...sfd, token, lastFetched: new Date() } 
        : sfd
    ));
    
    return token;
  }, [user]);

  // Switch the active SFD
  const switchActiveSfd = useCallback((sfdId: string) => {
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
    
    // Generate a new token for this SFD if needed
    if (!sfd.token || isTokenExpired(sfd.lastFetched)) {
      generateTokenForSfd(sfdId);
    }
    
    toast({
      title: "SFD changé",
      description: `Vous êtes maintenant connecté à ${sfd.name}`,
    });
    
    return true;
  }, [sfdData, setActiveSfdId, generateTokenForSfd, toast]);

  // Check if a token is expired (older than 50 minutes)
  const isTokenExpired = (lastFetched: Date | null): boolean => {
    if (!lastFetched) return true;
    
    const fiftyMinutesAgo = new Date();
    fiftyMinutesAgo.setMinutes(fiftyMinutesAgo.getMinutes() - 50);
    
    return lastFetched < fiftyMinutesAgo;
  };

  // Get current active SFD data
  const getActiveSfdData = useCallback((): SfdData | null => {
    if (!activeSfdId) return null;
    
    const sfd = sfdData.find(s => s.id === activeSfdId);
    if (!sfd) return null;
    
    // Regenerate token if needed
    if (!sfd.token || isTokenExpired(sfd.lastFetched)) {
      generateTokenForSfd(activeSfdId);
    }
    
    return sfd;
  }, [activeSfdId, sfdData, generateTokenForSfd]);

  // Get the current token for API calls
  const getCurrentSfdToken = useCallback((): string | null => {
    const activeSfd = getActiveSfdData();
    return activeSfd?.token || null;
  }, [getActiveSfdData]);

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
