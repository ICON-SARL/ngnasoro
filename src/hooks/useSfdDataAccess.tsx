
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
  const { user, activeSfdId, setActiveSfdId } = useAuth(); // Utiliser AuthContext comme source unique
  const [sfdData, setSfdData] = useState<SfdData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const { toast } = useToast();

  // Pas de gestion localStorage ici - délégué à AuthContext

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
    activeSfdId,        // Vient de AuthContext
    setActiveSfdId,     // Vient de AuthContext
    sfds: sfdData,      // Renommer pour cohérence
    isLoading,
    error
  };
}
