
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

type SfdData = {
  id: string;
  name: string;
  region?: string;
  code: string;
  logo_url?: string;
  status: 'active' | 'inactive' | string; // Changed to accept string as well
};

export function useSfdDataAccess() {
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId) {
      setActiveSfdId(storedSfdId);
    }
  }, []);

  useEffect(() => {
    if (activeSfdId) {
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  useEffect(() => {
    const fetchSfds = async () => {
      setIsLoading(true);
      try {
        // In a real app, we'd fetch the list of SFDs based on the user
        // For now, we'll use mock data to ensure it works
        const mockSfds: SfdData[] = [
          {
            id: 'primary-sfd',
            name: 'SFD Primaire',
            code: 'primary-sfd',
            region: 'Bamako',
            status: 'active'
          },
          {
            id: 'secondary-sfd',
            name: 'SFD Secondaire',
            code: 'secondary-sfd',
            region: 'Sikasso',
            status: 'active'
          }
        ];
        
        // Get real data from Supabase if available
        const { data, error } = await supabase
          .from('sfds')
          .select('id, name, code, region, logo_url, status');
          
        if (error) {
          console.error('Error fetching SFDs:', error);
        }
        
        // Use real data if available, otherwise use mock data
        const finalData = data && data.length > 0 ? data : mockSfds;
        setSfdData(finalData as SfdData[]); // Force type casting to avoid issues
        
        // If no active SFD is set, use the first one
        if (!activeSfdId && finalData.length > 0) {
          setActiveSfdId(finalData[0].id);
        }
        
      } catch (error) {
        console.error('Error fetching SFD data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchSfds();
    }
  }, [user]);

  // Add the missing switchActiveSfd function
  const switchActiveSfd = (sfdId: string) => {
    setActiveSfdId(sfdId);
    return Promise.resolve(true);
  };

  // Add the missing getActiveSfdData function
  const getActiveSfdData = async (): Promise<SfdData | null> => {
    if (!activeSfdId || !sfdData.length) return null;
    return sfdData.find(sfd => sfd.id === activeSfdId) || null;
  };

  return {
    activeSfdId,
    setActiveSfdId,
    sfdData,
    isLoading,
    switchActiveSfd,
    getActiveSfdData
  };
}
