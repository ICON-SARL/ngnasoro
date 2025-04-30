
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { savingsAccountService, SavingsTransactionOptions } from '@/services/savings/savingsAccountService';

/**
 * Hook for managing client savings account operations
 */
export function useSavingsAccount(clientId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get client account details
  const accountQuery = useQuery({
    queryKey: ['client-account', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      return savingsAccountService.getClientAccount(clientId);
    },
    enabled: !!clientId
  });
  
  // Get transaction history
  const transactionsQuery = useQuery({
    queryKey: ['client-transactions', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      return savingsAccountService.getTransactionHistory(clientId);
    },
    enabled: !!clientId
  });
  
  // Create savings account if doesn't exist
  const createAccount = useMutation({
    mutationFn: async ({ sfdId, initialBalance = 0 }: { sfdId: string, initialBalance?: number }) => {
      if (!clientId) throw new Error('Client ID is required');
      return savingsAccountService.createSavingsAccount(clientId, sfdId, initialBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      toast({
        title: "Compte créé avec succès",
        description: "Le compte d'épargne a été créé pour ce client"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer le compte: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Process a deposit transaction
  const processDeposit = async (amount: number, description?: string): Promise<boolean> => {
    try {
      if (!clientId) throw new Error('Client ID is required');
      if (amount <= 0) throw new Error('Le montant doit être supérieur à 0');

      // Using client ID as admin ID temporarily for simplicity
      // In a real app, this should come from the auth context
      await savingsAccountService.processTransaction({
        clientId,
        amount,
        description,
        adminId: clientId,  // Should be the actual admin ID
        transactionType: 'deposit'
      });
      
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'effectuer le dépôt: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Process a withdrawal
  const processWithdrawal = async (amount: number, description?: string): Promise<boolean> => {
    try {
      if (!clientId) throw new Error('Client ID is required');
      if (amount <= 0) throw new Error('Le montant doit être supérieur à 0');
      
      // Check if balance is sufficient
      const account = accountQuery.data;
      if (!account || account.balance < amount) {
        toast({
          title: "Solde insuffisant",
          description: "Le solde du compte est insuffisant pour ce retrait",
          variant: "destructive"
        });
        return false;
      }

      // Using client ID as admin ID temporarily for simplicity
      await savingsAccountService.processTransaction({
        clientId,
        amount,
        description,
        adminId: clientId,  // Should be the actual admin ID
        transactionType: 'withdrawal'
      });
      
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: `Impossible d'effectuer le retrait: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  return {
    account: accountQuery.data,
    transactions: transactionsQuery.data,
    isLoading: accountQuery.isLoading || transactionsQuery.isLoading,
    isError: accountQuery.isError || transactionsQuery.isError,
    createAccount,
    processDeposit,
    processWithdrawal,
    refetch: () => {
      accountQuery.refetch();
      transactionsQuery.refetch();
    }
  };
}
