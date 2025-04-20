
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { ClientAdhesionRequest } from '@/types/sfdClients';

export function useClientAdhesions() {
  const { user } = useAuth();
  
  const fetchAdhesionRequests = async (): Promise<ClientAdhesionRequest[]> => {
    try {
      if (!user?.id) return [];
      
      // Get SFD ID associated with the current admin
      const { data: userSfds, error: sfdsError } = await supabase
        .from('user_sfds')
        .select('sfd_id')
        .eq('user_id', user.id)
        .limit(1);
      
      if (sfdsError) throw sfdsError;
      
      if (!userSfds || userSfds.length === 0) {
        console.error('No SFD associated with this admin user');
        return [];
      }
      
      const sfdId = userSfds[0].sfd_id;
      
      // Fetch adhesion requests
      const { data, error } = await supabase
        .from('client_adhesion_requests')
        .select(`
          id,
          full_name,
          email,
          phone,
          address,
          id_number,
          id_type,
          status,
          created_at
        `)
        .eq('sfd_id', sfdId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as ClientAdhesionRequest[];
    } catch (error) {
      console.error('Error fetching adhesion requests:', error);
      return [];
    }
  };
  
  const { data: adhesionRequests = [], isLoading: isLoadingAdhesionRequests, error, refetch: refetchAdhesionRequests } = useQuery({
    queryKey: ['client-adhesion-requests'],
    queryFn: fetchAdhesionRequests,
    enabled: !!user?.id
  });
  
  return {
    adhesionRequests,
    isLoadingAdhesionRequests,
    error,
    refetchAdhesionRequests
  };
}
