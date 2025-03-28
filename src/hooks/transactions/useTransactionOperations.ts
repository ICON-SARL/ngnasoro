
import { useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { PaymentMethod } from '@/services/transactions/types';
import { useTransactionMutation } from './useTransactionMutation';
import { Transaction } from '@/types/transactions';

/**
 * Hook for common transaction operations like deposit, withdrawal, etc.
 */
export function useTransactionOperations(userId?: string, sfdId?: string) {
  const queryClient = useQueryClient();
  const { createTransaction } = useTransactionMutation();

  const getBalance = async (): Promise<number> => {
    try {
      if (!userId || !sfdId) return 0;
      return await transactionService.getAccountBalance(userId, sfdId);
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  };

  const makeDeposit = async (
    amount: number, 
    description?: string, 
    paymentMethod?: string
  ): Promise<Transaction | null> => {
    try {
      if (!userId || !sfdId) return null;
      
      const result = await createTransaction.mutateAsync({
        userId,
        sfdId,
        amount,
        type: 'deposit',
        name: description || 'Dépôt',
        description: description || 'Dépôt de fonds',
        paymentMethod: (paymentMethod || 'sfd_account') as PaymentMethod
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return result;
    } catch (error) {
      console.error('Error making deposit:', error);
      return null;
    }
  };

  const makeWithdrawal = async (
    amount: number, 
    description?: string, 
    paymentMethod?: string
  ): Promise<Transaction | null> => {
    try {
      if (!userId || !sfdId) return null;
      
      const result = await createTransaction.mutateAsync({
        userId,
        sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for withdrawals
        type: 'withdrawal',
        name: description || 'Retrait',
        description: description || 'Retrait de fonds',
        paymentMethod: (paymentMethod || 'sfd_account') as PaymentMethod
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return result;
    } catch (error) {
      console.error('Error making withdrawal:', error);
      return null;
    }
  };

  const makeLoanRepayment = async (
    loanId: string, 
    amount: number, 
    description?: string, 
    paymentMethod?: string
  ): Promise<Transaction | null> => {
    try {
      if (!userId || !sfdId) return null;
      
      const result = await createTransaction.mutateAsync({
        userId,
        sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for repayments
        type: 'loan_repayment',
        name: description || 'Remboursement de prêt',
        description: description || `Remboursement pour le prêt ${loanId}`,
        paymentMethod: (paymentMethod || 'sfd_account') as PaymentMethod,
        referenceId: loanId
      });
      
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      return result;
    } catch (error) {
      console.error('Error making loan repayment:', error);
      return null;
    }
  };

  return {
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  };
}
