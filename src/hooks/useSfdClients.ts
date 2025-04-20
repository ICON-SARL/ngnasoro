
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface SfdClient {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  created_at: string;
  kyc_level: number;
}

export function useSfdClients() {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['sfd-clients'],
    queryFn: async (): Promise<SfdClient[]> => {
      try {
        if (!user?.id) {
          throw new Error('User not authenticated');
        }
        
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
        
        // Fetch clients
        const { data, error } = await supabase
          .from('sfd_clients')
          .select('id, full_name, email, phone, status, created_at, kyc_level')
          .eq('sfd_id', sfdId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return data || [];
      } catch (error) {
        console.error('Error fetching SFD clients:', error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
}
