
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdData } from './types';
import { User } from '@/hooks/useAuth';

export function useSfdDataFetcher(setSfdData: React.Dispatch<React.SetStateAction<SfdData[]>>) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Fetch available SFDs for the current user
  const fetchUserSfds = useCallback(async (user: User | null) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching SFDs for user:', user.id);
      
      const { data: userSfds, error: userSfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id, is_default')
        .eq('user_id', user.id);
        
      if (userSfdsError) {
        console.error('Error fetching user SFDs:', userSfdsError);
        throw userSfdsError;
      }
      
      if (userSfds && userSfds.length > 0) {
        const sfdIds = userSfds.map(item => item.sfd_id);
        
        const { data: sfdsData, error: sfdsError } = await supabase
          .from('sfds')
          .select('*')
          .in('id', sfdIds);
          
        if (sfdsError) {
          console.error('Error fetching SFDs details:', sfdsError);
          throw sfdsError;
        }
        
        if (sfdsData) {
          // Map SFD data with is_default flag
          const sfdsWithDefault: SfdData[] = sfdsData.map(sfd => {
            const userSfd = userSfds.find(us => us.sfd_id === sfd.id);
            return {
              ...sfd,
              is_default: userSfd?.is_default || false
            } as SfdData;
          });
          
          setSfdData(sfdsWithDefault);
        }
      } else {
        console.log('User has no associated SFDs');
        setSfdData([]);
      }
    } catch (err: any) {
      console.error('Error fetching SFDs:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les SFDs associées à votre compte",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [setSfdData, toast]);

  return {
    loading,
    error,
    fetchUserSfds
  };
}
