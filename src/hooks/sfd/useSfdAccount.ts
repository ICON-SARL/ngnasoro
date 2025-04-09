
import { useQuery } from '@tanstack/react-query';
import { fetchSfdBalance } from './fetchSfdBalance';
import { fetchSfdLoans } from './fetchSfdLoans';
import { SfdAccount, SfdLoan } from './types';
import { User } from '../auth/types';

/**
 * Hook to fetch and manage data for a specific SFD account
 */
export function useSfdAccount(user: User | null, sfdId: string | null) {
  // Basic validation
  const enabled = Boolean(user?.id && sfdId);
  const userId = user?.id;

  // Query to fetch SFD account balance and details
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    isError: isBalanceError,
    refetch: refetchBalance
  } = useQuery({
    queryKey: ['sfd-balance', userId, sfdId],
    queryFn: () => fetchSfdBalance(userId as string, sfdId as string),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Query to fetch SFD loans associated with this account
  const {
    data: loansData,
    isLoading: isLoansLoading,
    isError: isLoansError,
    refetch: refetchLoans
  } = useQuery({
    queryKey: ['sfd-loans', userId, sfdId],
    queryFn: () => fetchSfdLoans(userId as string, sfdId as string),
    enabled,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });

  // Process the loan data to match the SfdLoan type
  const processSfdLoans = (loanData: any[]): SfdLoan[] => {
    if (!loanData || loanData.length === 0) return [];

    return loanData.map(loan => ({
      id: loan.id,
      amount: loan.amount,
      duration_months: loan.duration_months, 
      interest_rate: loan.interest_rate,
      monthly_payment: loan.monthly_payment,
      next_payment_date: loan.next_payment_date,
      last_payment_date: loan.last_payment_date,
      status: loan.status,
      created_at: loan.created_at,
      // Add computed properties used in components
      remainingAmount: loan.remaining_amount || loan.amount, // Add remainingAmount
      isLate: loan.is_late || false, // Add isLate
      nextDueDate: loan.next_due_date || loan.next_payment_date // Add nextDueDate
    }));
  };

  // Build the active SFD account object by combining balance and loan data
  const activeSfdAccount = enabled && balanceData ? {
    id: sfdId || 'unknown',
    name: balanceData.sfdName || balanceData.name || 'SFD Account',
    // Support both naming conventions for logo URL
    logo_url: balanceData.logo_url || balanceData.logoUrl,
    logoUrl: balanceData.logoUrl || balanceData.logo_url, // Support both property names
    balance: balanceData.balance,
    currency: balanceData.currency,
    isDefault: true, // This is the active account
    isVerified: true,
    loans: processSfdLoans(loansData || []),
    code: balanceData.code,
    region: balanceData.region
  } as SfdAccount : null;

  const refetch = () => {
    refetchBalance();
    refetchLoans();
  };

  return {
    activeSfdAccount,
    isLoading: isBalanceLoading || isLoansLoading,
    isError: isBalanceError || isLoansError,
    refetch
  };
}
