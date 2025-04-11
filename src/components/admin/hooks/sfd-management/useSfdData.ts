
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '../../types/sfd-types';

export function useSfdData() {
  const { 
    data: sfds, 
    isLoading, 
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['sfds'],
    queryFn: async (): Promise<Sfd[]> => {
      try {
        console.log('Fetching SFDs...');
        
        const { data, error } = await supabase
          .from('sfds')
          .select(`
            id,
            name,
            code,
            region,
            status,
            logo_url,
            contact_email,
            phone,
            description,
            created_at,
            updated_at
          `)
          .order('name');

        if (error) {
          console.error('Error fetching SFDs:', error);
          throw new Error(`Erreur lors de la récupération des SFDs: ${error.message}`);
        }

        console.log(`Retrieved ${data?.length || 0} SFDs`);
        return data || [];
      } catch (error: any) {
        console.error('Unhandled error in fetchSfds:', error);
        throw new Error(`Impossible de charger les SFDs: ${error.message}`);
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    refetchOnWindowFocus: false
  });

  return {
    sfds: sfds || [],
    isLoading,
    isError,
    error,
    refetch
  };
}
