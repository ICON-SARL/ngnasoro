
import { useQuery } from '@tanstack/react-query';
import { loanService } from '@/utils/sfdLoanApi';
import { Loan } from '@/types/sfdClients';

export function useLoan(loanId: string | undefined) {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: async (): Promise<Loan | null> => {
      if (!loanId) return null;
      return await loanService.fetchLoanById(loanId);
    },
    enabled: !!loanId
  });

  return {
    loan: data,
    isLoading,
    error,
    refetch
  };
}
