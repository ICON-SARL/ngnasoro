
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { SfdClient } from '@/types/sfdClients';

export const useClientDetails = (clientId: string) => {
  const fetchClientDetails = async (): Promise<SfdClient | null> => {
    if (!clientId) return null;
    
    const { data, error } = await supabase
      .from('sfd_clients')
      .select('*')
      .eq('id', clientId)
      .single();
      
    if (error) {
      console.error('Error fetching client details:', error);
      return null;
    }
    
    return data as SfdClient;
  };
  
  const clientQuery = useQuery({
    queryKey: ['client', clientId],
    queryFn: fetchClientDetails,
    enabled: !!clientId
  });
  
  return {
    client: clientQuery.data,
    isLoading: clientQuery.isLoading,
    isError: clientQuery.isError,
    refetch: clientQuery.refetch
  };
};
