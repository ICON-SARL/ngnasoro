
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
      
      // Construire la requête de base
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
        .eq('is_published', true); // Assurons-nous de ne montrer que les plans publiés
      
      // Si un SFD actif est sélectionné, filtrer par ce SFD
      if (activeSfdId) {
        query = query.eq('sfd_id', activeSfdId);
      }
      
      const { data: plansData, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching loan plans:', error);
        throw error;
      }

      console.log('Fetched loan plans:', plansData);
      
      // Make sure we only return published plans
      const publishedPlans = plansData?.filter(plan => plan.is_published === true) || [];
      console.log('Published plans:', publishedPlans);
      
      return publishedPlans as LoanPlan[] || [];
    },
    meta: {
      errorMessage: "Impossible de charger les plans de prêt"
    }
  });
}
