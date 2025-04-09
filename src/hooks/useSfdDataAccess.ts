
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { SfdData } from './sfd/types';

export interface UseSfdDataAccess {
  sfdData: SfdData[];
  isLoading: boolean;
  error: Error | null;
  refreshSfdData: () => Promise<void>;
  switchActiveSfd: (sfdId: string) => Promise<boolean>;
}

export type { SfdData };

export function useSfdDataAccess(): UseSfdDataAccess {
  const { user, setActiveSfdId } = useAuth();
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
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
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching SFD data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
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
  
  return {
    sfdData,
    isLoading,
    error,
    refreshSfdData,
    switchActiveSfd
  };
}

export default useSfdDataAccess;
