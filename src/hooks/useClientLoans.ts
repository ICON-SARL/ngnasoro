
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LoanApplication } from './useLoanApplication';

export interface Loan {
  id: string;
  amount: number;
  client_id: string;
  created_at: string;
  disbursed_at: string | null;
  duration_months: number;
  interest_rate: number;
  monthly_payment: number;
  purpose: string;
  sfd_id: string;
  sfd_name?: string;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'rejected';
  subsidy_amount?: number;
}

export function useClientLoans() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch all loans for the client
  const { data: loans, isLoading, error, refetch } = useQuery({
    queryKey: ['client-loans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // First try to get clients for this user
        const { data: clientsData, error: clientsError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id')
          .eq('user_id', user.id);
          
        if (clientsError) throw clientsError;
        
        if (!clientsData || clientsData.length === 0) {
          return [];
        }
        
        // Now get loans for each client
        const clientIds = clientsData.map(client => client.id);
        
        const { data: loansData, error: loansError } = await supabase
          .from('sfd_loans')
          .select(`
            *,
            sfds:sfd_id (name)
          `)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });
          
        if (loansError) throw loansError;
        
        // Format the data to match our interface
        return loansData.map(loan => ({
          ...loan,
          sfd_name: loan.sfds?.name
        })) as Loan[];
      } catch (error) {
        console.error("Error fetching client loans:", error);
        return [];
      }
    },
    enabled: !!user?.id,
  });
  
  // Apply for a loan
  const applyForLoan = useMutation({
    mutationFn: async (application: LoanApplication) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      // This will use our useLoanApplication hook
      const { submitApplication } = require('./useLoanApplication').useLoanApplication();
      return await submitApplication.mutateAsync(application);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-loans'] });
    }
  });
  
  return {
    loans,
    isLoading,
    error,
    refetch,
    applyForLoan
  };
}
