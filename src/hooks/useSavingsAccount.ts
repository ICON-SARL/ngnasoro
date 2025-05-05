import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { savingsAccountService, SavingsTransactionOptions } from '@/services/savings/savingsAccountService';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook for managing client savings account operations
 */
export function useSavingsAccount(clientId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId } = useAuth();
  
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
    mutationFn: async ({ initialBalance = 0, userId }: { initialBalance?: number, userId?: string }) => {
      if (!clientId) throw new Error('Client ID is required');
      if (!activeSfdId) throw new Error('SFD ID is required');
      
      let userIdToUse = userId;
      
      // If userId is not provided, try to get it from the client record
      if (!userIdToUse) {
        console.log('Fetching user_id from client record...');
        const { data: client, error: clientError } = await supabase
          .from('sfd_clients')
          .select('user_id')
          .eq('id', clientId)
          .single();
          
        if (clientError || !client?.user_id) {
          throw new Error("Impossible de trouver l'utilisateur associé au client");
        }
        
        userIdToUse = client.user_id;
      }
      
      console.log('Creating savings account for user:', userIdToUse);
      return savingsAccountService.createSavingsAccount(userIdToUse, activeSfdId, initialBalance);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      toast({
        title: "Compte créé avec succès",
        description: "Le compte d'épargne a été créé pour ce client"
      });
    },
    onError: (error: any) => {
      console.error("Erreur de création du compte:", error);
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
      
      if (!activeSfdId) throw new Error('SFD ID is required');

      // Get the client's user_id
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !client?.user_id) {
        throw new Error("Impossible de trouver l'utilisateur associé au client");
      }

      await savingsAccountService.processTransaction({
        userId: client.user_id,
        amount,
        description,
        adminId: clientId,  // Should be the actual admin ID
        transactionType: 'deposit',
        sfdId: activeSfdId
      });
      
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      return true;
    } catch (error: any) {
      console.error("Erreur de dépôt:", error);
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
      
      if (!activeSfdId) throw new Error('SFD ID is required');
      
      // Get the client's user_id
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !client?.user_id) {
        throw new Error("Impossible de trouver l'utilisateur associé au client");
      }
      
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

      await savingsAccountService.processTransaction({
        userId: client.user_id,
        amount,
        description,
        adminId: clientId,  // Should be the actual admin ID
        transactionType: 'withdrawal',
        sfdId: activeSfdId
      });
      
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      return true;
    } catch (error: any) {
      console.error("Erreur de retrait:", error);
      toast({
        title: "Erreur",
        description: `Impossible d'effectuer le retrait: ${error.message}`,
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Function to refetch the balance and transactions
  const refetchBalance = () => {
    accountQuery.refetch();
    transactionsQuery.refetch();
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
    },
    // Add the refetchBalance function to the return object
    refetchBalance
  };
}
