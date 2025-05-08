
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSfdLoanPlans() {
  const { user, activeSfdId } = useAuth();

  return useQuery({
    queryKey: ['sfd-loan-plans', activeSfdId],
    queryFn: async () => {
      // If no active SFD ID, get all plans
      let query = supabase
        .from('sfd_loan_plans')
        .select(`
          *,
          sfds:sfd_id (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .eq('is_published', true);
      
      // If there's an active SFD ID, filter by it
      if (activeSfdId) {
        query = query.eq('sfd_id', activeSfdId);
      }
      
      const { data: plansData, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return plansData || [];
    },
    meta: {
      errorMessage: "Impossible de charger les plans de prêt"
    }
  });
}
