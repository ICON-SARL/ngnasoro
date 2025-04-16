
import { useQuery } from '@tanstack/react-query';
import { loanService } from '@/utils/sfdLoanApi';

export const useSfdLoan = (loanId: string) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['loan', loanId],
    queryFn: async () => {
      if (!loanId) return null;
      return await loanService.fetchLoanById(loanId);
    },
    enabled: !!loanId
  });

  return {
    data,
    isLoading,
    error
  };
};
