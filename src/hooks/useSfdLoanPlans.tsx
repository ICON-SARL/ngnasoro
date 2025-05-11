
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoanPlan } from '@/types/sfdClients';

export function useSfdLoanPlans() {
  const { user, activeSfdId } = useAuth();

  return useQuery({
    queryKey: ['sfd-loan-plans', activeSfdId],
    queryFn: async () => {
      console.log('Fetching loan plans for SFD ID:', activeSfdId);
      
      // Build the base query
      let query = supabase
        .from('sfd_loan_plans')
        .select(`
          *,
          sfds:sfd_id (
            name,
            logo_url
          )
        `)
        .eq('is_active', true);
      
      // If an active SFD is selected, filter by this SFD
      if (activeSfdId) {
        console.log('Filtering by active SFD:', activeSfdId);
        query = query.eq('sfd_id', activeSfdId);
      }
      
      const { data: plansData, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan plans:', error);
        throw error;
      }

      console.log('Fetched loan plans:', plansData?.length);
      
      return plansData as LoanPlan[];
    },
    meta: {
      errorMessage: "Impossible de charger les plans de prêt"
    },
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
