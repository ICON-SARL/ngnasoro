
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { PaymentMethod } from '@/services/transactions/types';

/**
 * Hook for common transaction operations like deposit, withdrawal, etc.
 */
export function useTransactionOperations(userId?: string, sfdId?: string) {
  const queryClient = useQueryClient();

  const getBalance = async (): Promise<number> => {
    try {
      if (!userId) return 0;
      
      const { data, error } = await supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching balance:', error);
        return 0;
      }

      return data?.balance || 0;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  };

  const makeDeposit = useMutation({
    mutationFn: async (amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
      if (!userId || !sfdId) return null;
      
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        amount: amount,
        type: 'deposit',
        name: description || 'Dépôt',
        description: description || 'Dépôt de fonds',
        payment_method: paymentMethod || 'sfd_account',
        reference_id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'success'
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error making deposit:', error);
        return null;
      }

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      
      return data as Transaction;
    }
  });

  const makeWithdrawal = useMutation({
    mutationFn: async (amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
      if (!userId || !sfdId) return null;
      
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for withdrawals
        type: 'withdrawal',
        name: description || 'Retrait',
        description: description || 'Retrait de fonds',
        payment_method: paymentMethod || 'sfd_account',
        reference_id: `tx-${Date.now()}`,
        date: new Date().toISOString(),
        status: 'success'
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error making withdrawal:', error);
        return null;
      }

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['account-balance'] });
      
      return data as Transaction;
    }
  });

  const makeLoanRepayment = useMutation({
    mutationFn: async (loanId: string, amount: number, description?: string, paymentMethod?: string): Promise<Transaction | null> => {
      if (!userId || !sfdId) return null;
      
      const transactionData = {
        user_id: userId,
        sfd_id: sfdId,
        amount: -Math.abs(amount), // Ensure negative amount for repayments
        type: 'loan_repayment',
        name: description || 'Remboursement de prêt',
        description: description || `Remboursement pour le prêt ${loanId}`,
        payment_method: paymentMethod || 'sfd_account',
        reference_id: loanId,
        date: new Date().toISOString(),
        status: 'success'
      };

      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        console.error('Error making loan repayment:', error);
        return null;
      }

      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
      
      return data as Transaction;
    }
  });

  return {
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment
  };
}
