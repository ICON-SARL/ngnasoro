
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '../../types/sfd-types';

export function useSfdData() {
  // Fetch SFDs from Supabase
  const { data: sfds, isLoading, isError } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Sfd[];
    },
  });

  return {
    sfds,
    isLoading,
    isError
  };
}
