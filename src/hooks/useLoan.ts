
import { useQuery } from '@tanstack/react-query';
import { Loan } from '@/types/sfdClients';
import { loanService } from '@/utils/sfdLoanApi';

export const useLoan = (loanId: string) => {
  const query = useQuery({
    queryKey: ['loan', loanId],
    queryFn: async (): Promise<Loan | null> => {
      return loanService.fetchLoanById(loanId);
    },
    enabled: !!loanId
  });

  return {
    loan: query.data,
    isLoading: query.isLoading,
    error: query.error
  };
};
