
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loan } from '@/types/sfdClients';

export const useLoan = (loanId: string) => {
  const query = useQuery({
    queryKey: ['loan', loanId],
    queryFn: async (): Promise<Loan | null> => {
      if (!loanId) return null;
      
      const { data, error } = await supabase
        .from('sfd_loans')
        .select('*, sfd_clients(full_name, email)')
        .eq('id', loanId)
        .single();
      
      if (error) {
        console.error('Error fetching loan:', error);
        return null;
      }
      
      // Format the loan data with client information
      // Make sure we're only adding properties that exist on the Loan type
      const loan: Loan = {
        ...data,
        client_name: data.sfd_clients?.full_name || 'Unknown Client'
        // Removed client_email as it's not defined in the Loan type
      };
      
      return loan;
    },
    enabled: !!loanId
  });

  return {
    loan: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
