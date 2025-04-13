
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
      // Make sure we're adding all required properties that exist on the Loan type
      const loan: Loan = {
        ...data,
        client_name: data.sfd_clients?.full_name || 'Unknown Client',
        term_months: data.duration_months || 0, // Adding term_months (mapped from duration_months)
        updated_at: data.updated_at || data.created_at, // If updated_at doesn't exist, use created_at
        // Ensure all required properties from the Loan type are present
        status: data.status || 'pending',
        reference: data.reference || '',
        duration: data.duration_months // For backward compatibility
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
