
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '../../types/sfd-types';

export function useSfdData() {
  // Fetch SFDs from Supabase
  const { data: sfds, isLoading, isError, refetch } = useQuery({
    queryKey: ['sfds'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sfds')
        .select(`
          *,
          sfd_stats:sfd_stats(*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Calculate subsidy balance for each SFD
      const sfdsWithSubsidyBalance = await Promise.all(
        data.map(async (sfd) => {
          const { data: subsidies, error: subsidiesError } = await supabase
            .from('sfd_subsidies')
            .select('remaining_amount')
            .eq('sfd_id', sfd.id)
            .eq('status', 'active')
            .order('allocated_at', { ascending: false });

          let subsidy_balance = 0;
          if (!subsidiesError && subsidies) {
            subsidy_balance = subsidies.reduce((sum, subsidy) => sum + (subsidy.remaining_amount || 0), 0);
          }

          return {
            ...sfd,
            subsidy_balance
          };
        })
      );

      return sfdsWithSubsidyBalance as Sfd[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    sfds,
    isLoading,
    isError,
    refetch
  };
}
