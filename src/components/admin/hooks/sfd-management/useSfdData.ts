
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
        .select('*')
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

          // Instead of using a relation that might not exist, we'll fetch stats separately
          let sfdStats = null;
          try {
            // Try to get existing stats or return a default structure
            const { data: stats, error: statsError } = await supabase
              .from('sfd_stats')
              .select('id, sfd_id, total_clients, total_loans, repayment_rate, last_updated')
              .eq('sfd_id', sfd.id)
              .maybeSingle();

            if (!statsError && stats) {
              sfdStats = stats;
            } else {
              // Provide default stats structure if no stats exist
              sfdStats = {
                id: '',
                sfd_id: sfd.id,
                total_clients: 0,
                total_loans: 0,
                repayment_rate: 0,
                last_updated: new Date().toISOString()
              };
            }
          } catch (error) {
            console.error("Error fetching SFD stats:", error);
          }

          return {
            ...sfd,
            subsidy_balance,
            sfd_stats: sfdStats
          } as Sfd;
        })
      );

      return sfdsWithSubsidyBalance;
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
