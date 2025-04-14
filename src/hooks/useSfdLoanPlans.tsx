
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSfdLoanPlans() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sfd-loan-plans'],
    queryFn: async () => {
      const { data: plansData, error } = await supabase
        .from('sfd_loan_plans')
        .select(`
          *,
          sfds:sfd_id (
            name,
            logo_url
          )
        `)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

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
