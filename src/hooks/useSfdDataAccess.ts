
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface SfdData {
  id: string;
  name: string;
  code: string;
  logo_url?: string;
}

export const useSfdDataAccess = () => {
  const { user } = useAuth();
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSfdId, setActiveSfdId] = useState<string>('');
  
  // Renamed properties to match what's being used in SfdAdminDashboard.tsx
  const availableSfds = sfdData;
  const switchSfd = switchActiveSfd;
  
  useEffect(() => {
    if (user) {
      fetchUserSfds();
    }
  }, [user]);
  
  const fetchUserSfds = async () => {
    try {
      setLoading(true);
      
      // Fetch all SFDs linked to the user
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          sfds (
            id,
            name,
            code,
            logo_url
          )
        `)
        .eq('user_id', user?.id);
        
      if (error) throw error;
      
      const processedData = data?.map(item => item.sfds) || [];
      setSfdData(processedData);
      
      // Set active SFD from local storage or use the first one
      const storedActiveSfdId = localStorage.getItem('activeSfdId');
      if (storedActiveSfdId && processedData.find(sfd => sfd.id === storedActiveSfdId)) {
        setActiveSfdId(storedActiveSfdId);
      } else if (processedData.length > 0) {
        setActiveSfdId(processedData[0].id);
        localStorage.setItem('activeSfdId', processedData[0].id);
      }
      
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching SFD data:', err);
    } finally {
      setLoading(false);
    }
  };
  
  async function switchActiveSfd(sfdId: string): Promise<boolean> {
    const sfd = sfdData.find(s => s.id === sfdId);
    if (!sfd) return false;
    
    setActiveSfdId(sfdId);
    localStorage.setItem('activeSfdId', sfdId);
    return true;
  }
  
  async function getActiveSfdData() {
    if (!activeSfdId) return null;
    return sfdData.find(sfd => sfd.id === activeSfdId) || null;
  }
  
  async function getCurrentSfdToken() {
    if (!activeSfdId) return null;
    
    try {
      const { data, error } = await supabase
        .from('sfd_api_tokens')
        .select('token')
        .eq('sfd_id', activeSfdId)
        .eq('is_active', true)
        .single();
        
      if (error) throw error;
      return data?.token || null;
    } catch (err) {
      console.error('Error fetching SFD token:', err);
      return null;
    }
  }
  
  return {
    sfdData,
    loading,
    error,
    activeSfdId,
    fetchUserSfds,
    switchActiveSfd,
    getActiveSfdData,
    getCurrentSfdToken,
    // Aliased properties to match what's being used in SfdAdminDashboard.tsx
    availableSfds,
    switchSfd
  };
};
