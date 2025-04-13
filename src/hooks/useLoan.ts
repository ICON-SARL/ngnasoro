
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
      const loan: Loan = {
        ...data,
        // Since client_name is now in our Loan type, we can assign it
        client_name: data.sfd_clients?.full_name || 'Unknown Client',
        // Make sure all required properties are present
        id: data.id,
        client_id: data.client_id,
        sfd_id: data.sfd_id,
        amount: data.amount,
        duration_months: data.duration_months,
        interest_rate: data.interest_rate,
        monthly_payment: data.monthly_payment,
        purpose: data.purpose,
        status: data.status || 'pending',
        created_at: data.created_at,
        // Handle optional properties safely with optional chaining and nullish coalescing
        reference: data.reference ?? '',
        updated_at: data.updated_at ?? data.created_at
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
