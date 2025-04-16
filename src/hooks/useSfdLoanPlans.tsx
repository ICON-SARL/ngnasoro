
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoanPlan } from '@/types/sfdClients';
import { sfdCache } from '@/utils/cacheUtils';

export function useSfdLoanPlans() {
  const { user, activeSfdId } = useAuth();
  
  return useQuery({
    queryKey: ['sfd-loan-plans', activeSfdId],
    queryFn: async () => {
      // Check if data is in cache first
      const cacheKey = 'loan-plans';
      if (activeSfdId) {
        const cachedData = sfdCache.get(activeSfdId, cacheKey);
        if (cachedData) {
          console.log('[useSfdLoanPlans] Using cached loan plans data');
          return cachedData;
        }
      }
      
      console.log('[useSfdLoanPlans] Fetching fresh loan plans data');
      
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
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[useSfdLoanPlans] Error fetching loan plans:', error);
        throw error;
      }
      
      const data = plansData as LoanPlan[] || [];
      
      // Cache the data if we have an activeSfdId
      if (activeSfdId) {
        sfdCache.set(activeSfdId, cacheKey, data);
      }
      
      return data;
    },
    meta: {
      errorMessage: "Impossible de charger les plans de prêt"
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes - Changed from cacheTime to gcTime
  });
}

// Add a helper function to clear the loan plans cache
export function clearLoanPlansCache(sfdId?: string) {
  if (sfdId) {
    sfdCache.delete(sfdId, 'loan-plans');
  } else {
    // Clear for all SFDs if no specific ID provided
    sfdCache.clearAll();
  }
}
