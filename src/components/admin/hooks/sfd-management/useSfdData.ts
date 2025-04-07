
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Sfd } from '../../types/sfd-types';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

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
      
      // Calculate subsidy balance for each SFD separately from the sfd_subsidies table
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

          // Use edge function to fetch stats instead of RPC
          let sfdStats = null;
          try {
            const stats = await edgeFunctionApi.callEdgeFunction('fetch-sfd-stats', { 
              sfd_id: sfd.id 
            });
            
            if (stats) {
              sfdStats = stats;
            } else {
              // Provide default stats structure if no stats exist
              sfdStats = {
                id: null,
                sfd_id: sfd.id,
                total_clients: 0,
                total_loans: 0,
                repayment_rate: 0,
                last_updated: new Date().toISOString()
              };
            }
          } catch (error) {
            console.error("Error fetching SFD stats:", error);
            // Provide default stats on error
            sfdStats = {
              id: null,
              sfd_id: sfd.id,
              total_clients: 0,
              total_loans: 0,
              repayment_rate: 0,
              last_updated: new Date().toISOString()
            };
          }

          // Combine the data - subsidy_balance is calculated, not directly fetched
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
