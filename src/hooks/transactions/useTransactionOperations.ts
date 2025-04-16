
import { useQueryClient } from '@tanstack/react-query';
import { transactionService } from '@/services/transactions/transactionService';
import { PaymentMethod } from '@/services/transactions/types';
import { useTransactionMutation } from './useTransactionMutation';
import { Transaction } from '@/types/transactions';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook for common transaction operations like deposit, withdrawal, etc.
 */
export function useTransactionOperations(userId?: string, sfdId?: string) {
  const queryClient = useQueryClient();
  const { createTransaction } = useTransactionMutation();
  const { toast } = useToast();

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
      if (!userId || !sfdId) {
        toast({
          title: "Erreur",
          description: "Identifiants manquants pour le dépôt",
          variant: "destructive",
        });
        return null;
      }
      
      // Verify transaction security
      const isSecure = await transactionService.verifyTransactionSecurity(
        userId, 
        amount, 
        'deposit'
      );
      
      if (!isSecure) {
        toast({
          title: "Alerte de sécurité",
          description: "Cette transaction a été bloquée pour des raisons de sécurité",
          variant: "destructive",
        });
        return null;
      }
      
      // Process transaction atomically
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
      
      // Generate receipt
      try {
        // Convert result.id to string to fix the type error
        await transactionService.getTransactionReceipt(String(result.id));
      } catch (err) {
        console.warn('Receipt generation failed but transaction was successful:', err);
      }
      
      return result;
    } catch (error) {
      console.error('Error making deposit:', error);
      toast({
        title: "Erreur de dépôt",
        description: error.message || "Une erreur s'est produite lors du dépôt",
        variant: "destructive",
      });
      return null;
    }
  };

  const makeWithdrawal = async (
    amount: number, 
    description?: string, 
    paymentMethod?: string
  ): Promise<Transaction | null> => {
    try {
      if (!userId || !sfdId) {
        toast({
          title: "Erreur",
          description: "Identifiants manquants pour le retrait",
          variant: "destructive",
        });
        return null;
      }
      
      // Verify transaction security
      const isSecure = await transactionService.verifyTransactionSecurity(
        userId, 
        amount, 
        'withdrawal'
      );
      
      if (!isSecure) {
        toast({
          title: "Alerte de sécurité",
          description: "Cette transaction a été bloquée pour des raisons de sécurité",
          variant: "destructive",
        });
        return null;
      }
      
      // Check balance first (double check even though the server will also check)
      const balance = await getBalance();
      if (balance < amount) {
        toast({
          title: "Solde insuffisant",
          description: "Vous n'avez pas assez de fonds pour effectuer ce retrait",
          variant: "destructive",
        });
        return null;
      }
      
      // Process transaction atomically
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
      
      // Generate receipt
      try {
        // Convert result.id to string to fix the type error
        await transactionService.getTransactionReceipt(String(result.id));
      } catch (err) {
        console.warn('Receipt generation failed but transaction was successful:', err);
      }
      
      return result;
    } catch (error) {
      console.error('Error making withdrawal:', error);
      toast({
        title: "Erreur de retrait",
        description: error.message || "Une erreur s'est produite lors du retrait",
        variant: "destructive",
      });
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
      if (!userId || !sfdId) {
        toast({
          title: "Erreur",
          description: "Identifiants manquants pour le remboursement",
          variant: "destructive",
        });
        return null;
      }
      
      // Check balance first
      const balance = await getBalance();
      if (balance < amount) {
        toast({
          title: "Solde insuffisant",
          description: "Solde insuffisant pour effectuer ce remboursement",
          variant: "destructive",
        });
        return null;
      }
      
      // Process transaction atomically
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
      await queryClient.invalidateQueries({ queryKey: ['loans'] });
      
      // Generate receipt
      try {
        // Convert result.id to string to fix the type error
        await transactionService.getTransactionReceipt(String(result.id));
      } catch (err) {
        console.warn('Receipt generation failed but transaction was successful:', err);
      }
      
      return result;
    } catch (error) {
      console.error('Error making loan repayment:', error);
      toast({
        title: "Erreur de remboursement",
        description: error.message || "Une erreur s'est produite lors du remboursement",
        variant: "destructive",
      });
      return null;
    }
  };

  const processMobileMoneyTransaction = async (
    phoneNumber: string,
    amount: number,
    type: 'deposit' | 'withdrawal' | 'payment',
    description?: string
  ): Promise<boolean> => {
    try {
      if (!userId || !sfdId) {
        toast({
          title: "Erreur",
          description: "Identifiants manquants pour la transaction Mobile Money",
          variant: "destructive",
        });
        return false;
      }
      
      // Process mobile money transaction
      const success = await transactionService.processMobileMoneyTransaction(
        phoneNumber,
        amount,
        description || `Transaction Mobile Money (${type})`,
        type
      );
      
      if (success) {
        toast({
          title: "Transaction initiée",
          description: "La transaction Mobile Money a été initiée avec succès",
        });
        
        await queryClient.invalidateQueries({ queryKey: ['transactions'] });
        return true;
      } else {
        toast({
          title: "Échec de la transaction",
          description: "La transaction Mobile Money a échoué",
          variant: "destructive",
        });
        return false;
      }
    } catch (error) {
      console.error('Error processing mobile money transaction:', error);
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la transaction Mobile Money",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    getBalance,
    makeDeposit,
    makeWithdrawal,
    makeLoanRepayment,
    processMobileMoneyTransaction
  };
}
