
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
  const processDeposit = useMutation({
    mutationFn: async ({ amount, description, adminId }: Omit<SavingsTransactionOptions, 'clientId' | 'transactionType'>) => {
      if (!clientId) throw new Error('Client ID is required');
      return savingsAccountService.processTransaction({
        clientId,
        amount,
        description,
        adminId,
        transactionType: 'deposit'
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      toast({
        title: "Dépôt effectué",
        description: "Le dépôt a été effectué avec succès"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible d'effectuer le dépôt: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  // Process a loan disbursement
  const processLoanDisbursement = useMutation({
    mutationFn: async ({ amount, loanId, adminId, description }: { amount: number, loanId: string, adminId: string, description?: string }) => {
      if (!clientId) throw new Error('Client ID is required');
      return savingsAccountService.processTransaction({
        clientId,
        amount,
        description: description || `Décaissement du prêt ${loanId}`,
        adminId,
        transactionType: 'loan_disbursement',
        referenceId: loanId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      queryClient.invalidateQueries({ queryKey: ['loans'] }); // Invalidate loans queries to refresh loan status
      toast({
        title: "Prêt décaissé",
        description: "Le montant du prêt a été crédité sur le compte du client"
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de décaisser le prêt: ${error.message}`,
        variant: "destructive"
      });
    }
  });
  
  return {
    account: accountQuery.data,
    transactions: transactionsQuery.data,
    isLoading: accountQuery.isLoading || transactionsQuery.isLoading,
    isError: accountQuery.isError || transactionsQuery.isError,
    createAccount,
    processDeposit,
    processLoanDisbursement,
    refetch: () => {
      accountQuery.refetch();
      transactionsQuery.refetch();
    }
  };
}
