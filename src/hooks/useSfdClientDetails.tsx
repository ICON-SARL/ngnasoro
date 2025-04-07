
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';

export function useSfdClientDetails(clientId?: string) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-client', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('id', clientId)
        .single();
        
      if (error) throw new Error(`Impossible de récupérer les détails du client: ${error.message}`);
      return data as SfdClient;
    },
    enabled: !!clientId
  });
  
  return {
    client: data,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch
  };
}
