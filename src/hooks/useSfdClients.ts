
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { SfdClient } from '@/types/sfdClients';

export function useSfdClients() {
  const { user } = useAuth();
  
  const { data: clients = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sfd-clients'],
    queryFn: async (): Promise<SfdClient[]> => {
      try {
        if (!user?.id) {
          console.log('User not authenticated, returning empty clients array');
          return [];
        }
        
        console.log('Fetching SFD clients for user:', user.id);
        
        // Get SFD ID associated with the current admin
        const { data: userSfds, error: sfdsError } = await supabase
          .from('user_sfds')
          .select('sfd_id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (sfdsError) {
          console.error('Error fetching user SFDs:', sfdsError);
          throw sfdsError;
        }
        
        if (!userSfds || userSfds.length === 0) {
          console.error('No SFD associated with this admin user');
          return [];
        }
        
        const sfdId = userSfds[0].sfd_id;
        console.log('Found SFD ID:', sfdId);
        
        // Fetch clients
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('id, full_name, email, phone, status, created_at, kyc_level')
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });
          
        if (error) {
          console.error('Error fetching SFD clients:', error);
          throw error;
        }
        
        console.log('Fetched clients:', data ? data.length : 0);
        return data || [];
      } catch (error) {
        console.error('Error in useSfdClients hook:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
  
  return {
    clients,
    isLoading,
    error,
    refetch
  };
}
