
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface LoanStats {
  totalLoans: number;
  activeLoans: number;
  pendingLoans: number;
  totalLoanAmount: number;
  disbursedAmount: number;
}

export function useSfdLoanStats(sfdId: string | null) {
  const fetchLoanStats = async (): Promise<LoanStats> => {
    if (!sfdId) return {
      totalLoans: 0,
      activeLoans: 0,
      pendingLoans: 0,
      totalLoanAmount: 0,
      disbursedAmount: 0
    };

    try {
      // Get all loans for this SFD
      const { data: loans, error: loansError } = await supabase
        .from('sfd_loans')
        .select('id, amount, status')
        .eq('sfd_id', sfdId);
      
      if (loansError) throw loansError;
      
      if (!loans || loans.length === 0) {
        return {
          totalLoans: 0,
          activeLoans: 0,
          pendingLoans: 0,
          totalLoanAmount: 0,
          disbursedAmount: 0
        };
      }

      // Calculate statistics
      const totalLoans = loans.length;
      const activeLoans = loans.filter(loan => 
        loan.status === 'active' || loan.status === 'disbursed').length;
      const pendingLoans = loans.filter(loan => 
        loan.status === 'pending' || loan.status === 'approved').length;
      const totalLoanAmount = loans.reduce((sum, loan) => sum + (loan.amount || 0), 0);
      const disbursedAmount = loans
        .filter(loan => loan.status === 'disbursed' || loan.status === 'active')
        .reduce((sum, loan) => sum + (loan.amount || 0), 0);

      return {
        totalLoans,
        activeLoans,
        pendingLoans,
        totalLoanAmount,
        disbursedAmount
      };
    } catch (error) {
      console.error('Error fetching loan stats:', error);
      return {
        totalLoans: 0,
        activeLoans: 0,
        pendingLoans: 0,
        totalLoanAmount: 0,
        disbursedAmount: 0
      };
    }
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['sfd-loan-stats', sfdId],
    queryFn: fetchLoanStats,
    enabled: !!sfdId,
    staleTime: 1000 * 60 * 5 // 5 minutes
  });

  return {
    loanStats: data || {
      totalLoans: 0,
      activeLoans: 0,
      pendingLoans: 0,
      totalLoanAmount: 0,
      disbursedAmount: 0
    },
    isLoading,
    error
  };
}
