
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

  // Simplifier la logique pour récupérer les SFDs actives
  useEffect(() => {
    const fetchSfds = async () => {
      setIsLoading(true);
      try {
        console.log('Fetching active SFDs from database...');
        
        // Récupérer directement les SFDs actives
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
          
          // Si aucune SFD active n'est définie et qu'on a des SFDs, définir la première comme active
          if ((!activeSfdId || activeSfdId.trim() === '') && directSfds.length > 0) {
            console.log('Setting first active SFD as default:', directSfds[0].id);
            setActiveSfdId(directSfds[0].id);
          }
        } else {
          console.log('No active SFDs found in database');
          setSfdData([]);
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
