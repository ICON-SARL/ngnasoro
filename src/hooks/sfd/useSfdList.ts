
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useSfdList = (user: User | null) => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['sfd-accounts', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data: sfdClients, error } = await supabase
        .from('sfd_clients')
        .select(`
          id,
          sfd_id,
          status,
          sfds (
            id,
            name,
            code,
            region,
            logo_url
          )
        `)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching SFD accounts:', error);
        return [];
      }

      return sfdClients.map(client => ({
        id: client.sfd_id,
        name: client.sfds?.name,
        code: client.sfds?.code,
        region: client.sfds?.region,
        logo_url: client.sfds?.logo_url,
        status: client.status,
        isVerified: client.status === 'validated',
        isDefault: false
      }));
    },
    enabled: !!user,
  });

  return {
    sfdAccounts: data || [],
    isLoading,
    isError,
    refetch
  };
};
