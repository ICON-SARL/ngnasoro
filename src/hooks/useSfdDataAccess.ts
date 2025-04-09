
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SfdData } from './sfd/types';

export interface UseSfdDataAccess {
  sfdData: SfdData[];
  isLoading: boolean;
  error: Error | null;
  refreshSfdData: () => Promise<void>;
  switchActiveSfd: (sfdId: string) => Promise<boolean>;
  activeSfdId: string | null;  // Add the missing property
  setActiveSfdId: (sfdId: string | null) => void;  // Add the missing property
  getActiveSfdData: () => Promise<SfdData | null>;  // Add the missing property
}

export type { SfdData };

export function useSfdDataAccess(): UseSfdDataAccess {
  const { user, setActiveSfdId: authSetActiveSfdId } = useAuth();
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeSfdId, setActiveSfdIdState] = useState<string | null>(null);
  
  // Sync activeSfdId with local storage and auth context
  const setActiveSfdId = (sfdId: string | null) => {
    setActiveSfdIdState(sfdId);
    if (authSetActiveSfdId) {
      authSetActiveSfdId(sfdId);
    }
    if (sfdId) {
      localStorage.setItem('activeSfdId', sfdId);
    } else {
      localStorage.removeItem('activeSfdId');
    }
  };
  
  // Function to fetch SFD data
  const fetchSfdData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!user) {
        setSfdData([]);
        return;
      }
      
      // Mock data for demonstration
      const mockSfds: SfdData[] = [
        { 
          id: 'sfd1', 
          name: 'SFD 1', 
          code: 'SFD1', 
          region: 'Region 1',
          status: 'active'
        },
        { 
          id: 'sfd2', 
          name: 'SFD 2', 
          code: 'SFD2', 
          region: 'Region 2',
          status: 'active'
        },
        { 
          id: 'sfd3', 
          name: 'SFD 3', 
          code: 'SFD3', 
          region: 'Region 3',
          status: 'active'
        }
      ];
      
      setSfdData(mockSfds);
      
      // If no active SFD is set but we have SFDs, set the first one
      if (!activeSfdId && mockSfds.length > 0) {
        setActiveSfdId(mockSfds[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching SFD data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load activeSfdId from local storage on mount
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }
  }, []);
  
  // Fetch data on component mount or when user changes
  useEffect(() => {
    fetchSfdData();
  }, [user?.id]);
  
  // Function to refresh data
  const refreshSfdData = async () => {
    await fetchSfdData();
  };
  
  // Function to switch active SFD
  const switchActiveSfd = async (sfdId: string): Promise<boolean> => {
    try {
      setActiveSfdId(sfdId);
      return true;
    } catch (err) {
      console.error('Error switching active SFD:', err);
      return false;
    }
  };
  
  // Function to get active SFD data
  const getActiveSfdData = async (): Promise<SfdData | null> => {
    if (!activeSfdId || !sfdData.length) return null;
    return sfdData.find(sfd => sfd.id === activeSfdId) || null;
  };
  
  return {
    sfdData,
    isLoading,
    error,
    refreshSfdData,
    switchActiveSfd,
    activeSfdId,
    setActiveSfdId,
    getActiveSfdData
  };
}

export default useSfdDataAccess;
