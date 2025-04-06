
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SfdData } from './types';
import { User } from '@/hooks/useAuth';

interface UserSfdResult {
  id: string;
  is_default: boolean;
  sfds: {
    id: string;
    name: string;
    code: string;
    region: string;
  };
}

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
      
      // Fetch SFDs from the database using the user_sfds join table
      const { data, error } = await supabase
        .from('user_sfds')
        .select(`
          id,
          is_default,
          sfds:sfd_id(id, name, code, region)
        `)
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      if (data) {
        const typedData = data as unknown as UserSfdResult[];
        const sfdList: SfdData[] = typedData.map(item => ({
          id: item.sfds.id,
          name: item.sfds.name,
          token: null,
          lastFetched: null
        }));
        
        setSfdData(sfdList);
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
  }, [setSfdData, toast]);

  return {
    loading,
    error,
    fetchUserSfds
  };
}
