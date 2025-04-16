
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

// Extend the Loan type to include sfd_name for proper typing
interface LoanWithSfd extends Loan {
  sfd_name?: string;
}

export function useSfdLoan(loanId: string) {
  return useQuery({
    queryKey: ['loan', loanId],
    queryFn: async (): Promise<LoanWithSfd | null> => {
      if (!loanId) return null;

      // Fetch the loan with the SFD name included via a join
      const { data, error } = await supabase
        .from('sfd_loans')
        .select(`
          *,
          sfd_name:sfds(name)
        `)
        .eq('id', loanId)
        .single();

      if (error) {
        console.error('Error fetching loan:', error);
        throw new Error('Failed to fetch loan details');
      }

      if (!data) return null;

      // Transform the data to match the expected structure
      return {
        ...data,
        sfd_name: data.sfd_name?.name
      } as LoanWithSfd;
    },
    enabled: !!loanId,
  });
}
