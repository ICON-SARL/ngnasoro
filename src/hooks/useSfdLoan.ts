
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useSfdLoan(loanId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['sfd-loan', loanId],
    queryFn: async () => {
      if (!loanId || !user?.id) {
        return null;
      }

      try {
        // Get the loan details
        const { data: loan, error } = await supabase
          .from('sfd_loans')
          .select(`
            *,
            sfds:sfd_id (
              id,
              name,
              logo_url
            )
          `)
          .eq('id', loanId)
          .single();

        if (error) {
          console.error('Error fetching loan:', error);
          return null;
        }

        // Add the SFD name for easier access
        return {
          ...loan,
          sfd_name: loan.sfds?.name
        };
      } catch (err) {
        console.error('Error in useSfdLoan hook:', err);
        return null;
      }
    },
    enabled: !!loanId && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once to avoid excessive retries on permission issues
  });
}

export default useSfdLoan;
