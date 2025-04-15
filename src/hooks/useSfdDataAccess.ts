import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import { SfdData } from './sfd/types';

export function useSfdDataAccess() {
  const [activeSfdId, setActiveSfdId] = useState<string | null>(null);
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const { user } = useAuth();
  const { toast } = useToast();

  // Retrieve stored SFD ID on mount
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId && storedSfdId.trim() !== '') {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Save SFD ID to localStorage when it changes
  useEffect(() => {
    if (activeSfdId && activeSfdId.trim() !== '') {
      console.log('Setting active SFD ID in localStorage:', activeSfdId);
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  // Fetch SFDs for the current user
  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching SFDs for user:', user.id);
        
        // First try direct database query for all active SFDs
        const { data: directSfds, error: directError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
          
        if (directError) {
          console.error('Error fetching SFDs directly:', directError);
        } else if (directSfds && directSfds.length > 0) {
          console.log(`Found ${directSfds.length} active SFDs directly`);
          setSfdData(directSfds as SfdData[]);
          
          // If no active SFD is set and we have SFDs, set the first one as active
          if ((!activeSfdId || activeSfdId.trim() === '') && directSfds.length > 0) {
            console.log('Setting first SFD as active:', directSfds[0].id);
            setActiveSfdId(directSfds[0].id);
          }
          
          setIsLoading(false);
          return;
        }
        
        // If direct query fails, try the edge function
        const { data, error } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user.id }
        });
          
        if (error) {
          console.error('Error fetching SFDs from edge function:', error);
          throw error;
        }
        
        if (!data) {
          console.log('No SFDs returned from edge function');
          setSfdData([]);
          return;
        }
        
        // Handle potential error returned in data
        if (data.error) {
          console.error('Error returned by the edge function:', data.error);
          throw new Error(data.error);
        }
        
        console.log('SFDs retrieved:', data);
        
        // Transform data if necessary
        const formattedSfds = Array.isArray(data) ? data : [];
        setSfdData(formattedSfds as SfdData[]);
        
        // If no active SFD is defined and we have SFDs, set the first one as active
        if ((!activeSfdId || activeSfdId.trim() === '') && formattedSfds.length > 0) {
          // Look for a default SFD, otherwise take the first one
          const defaultSfd = formattedSfds.find(sfd => sfd.is_default);
          
          if (defaultSfd) {
            console.log('Setting default SFD as active:', defaultSfd.id);
            setActiveSfdId(defaultSfd.id);
          } else if (formattedSfds.length > 0) {
            console.log('No default SFD found, setting first SFD as active:', formattedSfds[0].id);
            setActiveSfdId(formattedSfds[0].id);
          }
        }
      } catch (err: any) {
        console.error('Error in fetchSfds:', err);
        setError(err.message);
        
        // Add fallback data for development
        setSfdData([
          {
            id: 'test-sfd1',
            name: 'RMCR (Test)',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            token: null,
            lastFetched: null
          },
          {
            id: 'test-sfd2',
            name: 'NYESIGISO (Test)',
            code: 'NYESIGISO',
            region: 'Sud',
            status: 'active',
            token: null,
            lastFetched: null
          }
        ]);
        
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les SFDs associées à votre compte",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, [user, toast, activeSfdId]);

  // Retrieve stored SFD ID on mount
  useEffect(() => {
    const storedSfdId = localStorage.getItem('activeSfdId');
    if (storedSfdId && storedSfdId.trim() !== '') {
      console.log('Found stored SFD ID:', storedSfdId);
      setActiveSfdId(storedSfdId);
    }
  }, []);

  // Save SFD ID to localStorage when it changes
  useEffect(() => {
    if (activeSfdId && activeSfdId.trim() !== '') {
      console.log('Setting active SFD ID in localStorage:', activeSfdId);
      localStorage.setItem('activeSfdId', activeSfdId);
    }
  }, [activeSfdId]);

  // Fetch SFDs for the current user
  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        console.log('Fetching SFDs for user:', user.id);

        // First try direct database query for all active SFDs
        const { data: directSfds, error: directError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');

        if (directError) {
          console.error('Error fetching SFDs directly:', directError);
        } else if (directSfds && directSfds.length > 0) {
          console.log(`Found ${directSfds.length} active SFDs directly`);
          setSfdData(directSfds as SfdData[]);

          // If no active SFD is set and we have SFDs, set the first one as active
          if ((!activeSfdId || activeSfdId.trim() === '') && directSfds.length > 0) {
            console.log('Setting first SFD as active:', directSfds[0].id);
            setActiveSfdId(directSfds[0].id);
          }

          setIsLoading(false);
          return;
        }

        // If direct query fails, try the edge function
        const { data, error } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user.id }
        });

        if (error) {
          console.error('Error fetching SFDs from edge function:', error);
          throw error;
        }

        if (!data) {
          console.log('No SFDs returned from edge function');
          setSfdData([]);
          return;
        }

        // Handle potential error returned in data
        if (data.error) {
          console.error('Error returned by the edge function:', data.error);
          throw new Error(data.error);
        }

        console.log('SFDs retrieved:', data);

        // Transform data if necessary
        const formattedSfds = Array.isArray(data) ? data : [];
        setSfdData(formattedSfds as SfdData[]);

        // If no active SFD is defined and we have SFDs, set the first one as active
        if ((!activeSfdId || activeSfdId.trim() === '') && formattedSfds.length > 0) {
          // Look for a default SFD, otherwise take the first one
          const defaultSfd = formattedSfds.find(sfd => sfd.is_default);

          if (defaultSfd) {
            console.log('Setting default SFD as active:', defaultSfd.id);
            setActiveSfdId(defaultSfd.id);
          } else if (formattedSfds.length > 0) {
            console.log('No default SFD found, setting first SFD as active:', formattedSfds[0].id);
            setActiveSfdId(formattedSfds[0].id);
          }
        }
      } catch (err: any) {
        console.error('Error in fetchSfds:', err);
        setError(err.message);

        // Add fallback data for development
        setSfdData([
          {
            id: 'test-sfd1',
            name: 'RMCR (Test)',
            code: 'RMCR',
            region: 'Centre',
            status: 'active',
            token: null,
            lastFetched: null
          },
          {
            id: 'test-sfd2',
            name: 'NYESIGISO (Test)',
            code: 'NYESIGISO',
            region: 'Sud',
            status: 'active',
            token: null,
            lastFetched: null
          }
        ]);

        toast({
          title: "Erreur",
          description: "Impossible de récupérer les SFDs associées à votre compte",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSfds();
  }, [user, toast, activeSfdId]);

  return {
    activeSfdId,
    sfdData,
    isLoading,
    error,
    setActiveSfd: (sfdId: string) => setActiveSfdId(sfdId),
    setActiveSfdId,
    switchActiveSfd: async (sfdId: string) => {
      if (!user) return false;
      setActiveSfdId(sfdId);
      return true;
    },
    getActiveSfdData: async () => {
      if (!activeSfdId) return null;
      return sfdData.find(s => s.id === activeSfdId) || null;
    },
    associateUserWithSfd: async (sfdId: string) => {
      if (!user) return false;
      return true;
    }
  };
}

export type { SfdData };
