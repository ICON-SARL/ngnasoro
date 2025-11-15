import { UseMutationResult } from '@tanstack/react-query';
import { Loan } from './sfdClients';

/**
 * Common interface for all loan hooks (Admin and Client)
 */
export interface LoanHookReturn {
  data: Loan[];
  loans: Loan[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void | Promise<any>;
  createLoan: UseMutationResult<any, Error, any, unknown>;
  approveLoan: UseMutationResult<any, any, string, unknown>;
  rejectLoan: UseMutationResult<any, any, string, unknown>;
  disburseLoan: UseMutationResult<any, any, string, unknown>;
  recordPayment: UseMutationResult<any, any, { loanId: string; amount: number; paymentMethod: string; }, unknown>;
}
