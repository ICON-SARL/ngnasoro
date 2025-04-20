
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface SfdData {
  id: string;
  name: string;
  code?: string;
  logo_url?: string;
  region?: string;
  status: string;
}

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

  // Update the fetchSfds function to only get active SFDs
  useEffect(() => {
    const fetchSfds = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        console.log('Fetching active SFDs for user:', user.id);
        
        // First try direct database query for active SFDs
        const { data: directSfds, error: directError } = await supabase
          .from('sfds')
          .select('*')
          .eq('status', 'active');
          
        if (directError) {
          console.error('Error fetching active SFDs:', directError);
          throw directError;
        }

        if (directSfds && directSfds.length > 0) {
          console.log(`Found ${directSfds.length} active SFDs`);
          setSfdData(directSfds);
          
          // If no active SFD is set and we have SFDs, set the first one as active
          if ((!activeSfdId || activeSfdId.trim() === '') && directSfds.length > 0) {
            console.log('Setting first active SFD as default:', directSfds[0].id);
            setActiveSfdId(directSfds[0].id);
          }
          
          setIsLoading(false);
          return;
        }

        // If no SFDs found, try the edge function
        const { data, error } = await supabase.functions.invoke('fetch-sfds', {
          body: { userId: user.id }
        });

        if (error) throw error;
        
        const activeSfds = Array.isArray(data) ? data.filter(sfd => sfd.status === 'active') : [];
        console.log(`Found ${activeSfds.length} active SFDs from edge function`);
        
        setSfdData(activeSfds);
        
        if ((!activeSfdId || activeSfdId.trim() === '') && activeSfds.length > 0) {
          setActiveSfdId(activeSfds[0].id);
        }
      } catch (err: any) {
        console.error('Error fetching SFDs:', err);
        setError(err.message);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les SFDs disponibles",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSfds();
  }, [user, toast, activeSfdId]);

  return {
    activeSfdId,
    setActiveSfdId,
    sfdData,
    isLoading,
    error
  };
}
