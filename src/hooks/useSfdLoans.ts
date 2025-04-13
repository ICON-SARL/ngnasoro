
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateLoanInput, createLoan } from '@/services/loans';

export const useSfdLoans = () => {
  const queryClient = useQueryClient();
  
  const createLoanMutation = useMutation({
    mutationFn: async (loanData: CreateLoanInput) => {
      return await createLoan(loanData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
    }
  });
  
  return {
    createLoan: createLoanMutation
  };
};
