
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { savingsAccountService } from '@/services/savings/savingsAccountService';

export function useClientSavingsAccount(clientId: string) {
  const [account, setAccount] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const { toast } = useToast();
  const { activeSfdId } = useAuth();

  // Fetch account data
  const fetchAccountData = useCallback(async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const accountData = await savingsAccountService.getClientAccount(clientId);
      setAccount(accountData || null);
    } catch (error: any) {
      console.error('Error fetching client account:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les informations du compte",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [clientId, toast]);

  // Fetch transaction history
  const fetchTransactionHistory = useCallback(async () => {
    if (!clientId) return;
    
    try {
      const transactionsData = await savingsAccountService.getTransactionHistory(clientId);
      setTransactions(transactionsData || []);
    } catch (error: any) {
      console.error('Error fetching transaction history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'historique des transactions",
        variant: "destructive",
      });
    }
  }, [clientId, toast]);

  // Process a deposit
  const processDeposit = useCallback(async (amount: number, description?: string) => {
    if (!clientId || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "Information client ou SFD manquante",
        variant: "destructive",
      });
      return false;
    }
    
    if (!amount || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Montant invalide pour le dépôt",
        variant: "destructive",
      });
      return false;
    }
    
    setIsTransactionLoading(true);
    try {
      // First get the user_id from the client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        toast({
          title: "Erreur",
          description: "Client non trouvé ou compte utilisateur non associé",
          variant: "destructive",
        });
        return false;
      }
      
      // Use the service to process the transaction
      await savingsAccountService.processTransaction({
        userId: client.user_id,
        amount,
        description,
        transactionType: 'deposit',
        sfdId: activeSfdId
      });
      
      toast({
        title: "Dépôt effectué",
        description: `${amount} FCFA ont été déposés sur le compte client`,
      });
      
      // Refresh account data and transaction history
      await fetchAccountData();
      await fetchTransactionHistory();
      
      return true;
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'effectuer le dépôt",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  }, [clientId, toast, fetchAccountData, fetchTransactionHistory, activeSfdId]);

  // Process a withdrawal
  const processWithdrawal = useCallback(async (amount: number, description?: string) => {
    if (!clientId || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "Information client ou SFD manquante",
        variant: "destructive",
      });
      return false;
    }
    
    if (!amount || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Montant invalide pour le retrait",
        variant: "destructive",
      });
      return false;
    }
    
    if (!account || account.balance < amount) {
      toast({
        title: "Solde insuffisant",
        description: "Le solde du compte est insuffisant pour ce retrait",
        variant: "destructive",
      });
      return false;
    }
    
    setIsTransactionLoading(true);
    try {
      // First get the user_id from the client record
      const { data: client, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (clientError || !client?.user_id) {
        toast({
          title: "Erreur",
          description: "Client non trouvé ou compte utilisateur non associé",
          variant: "destructive",
        });
        return false;
      }
      
      // Use the service to process the transaction
      await savingsAccountService.processTransaction({
        userId: client.user_id,
        amount,
        description,
        transactionType: 'withdrawal',
        sfdId: activeSfdId
      });
      
      toast({
        title: "Retrait effectué",
        description: `${amount} FCFA ont été retirés du compte client`,
      });
      
      // Refresh account data and transaction history
      await fetchAccountData();
      await fetchTransactionHistory();
      
      return true;
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'effectuer le retrait",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  }, [clientId, account, toast, fetchAccountData, fetchTransactionHistory, activeSfdId]);

  // Create a new account if it doesn't exist
  const createAccount = useCallback(async (initialBalance: number = 0) => {
    if (!clientId || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "ID client ou SFD invalide",
        variant: "destructive",
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      const result = await savingsAccountService.createClientSavingsAccount(clientId, activeSfdId, initialBalance);
      
      if (result) {
        toast({
          title: "Compte créé",
          description: "Le compte d'épargne client a été créé avec succès",
        });
        
        // Refresh data
        await fetchAccountData();
        await fetchTransactionHistory();
        
        return true;
      } else {
        throw new Error("Échec de la création du compte");
      }
    } catch (error: any) {
      console.error('Error creating account:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer le compte client: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, activeSfdId, toast, fetchAccountData, fetchTransactionHistory]);

  // Ensure client has a savings account
  const ensureSavingsAccount = useCallback(async () => {
    if (!clientId || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "ID client ou SFD invalide",
        variant: "destructive",
      });
      return false;
    }
    
    setIsLoading(true);
    try {
      const success = await savingsAccountService.ensureClientSavingsAccount(clientId, activeSfdId);
      
      if (success) {
        toast({
          title: "Compte créé",
          description: "Le compte d'épargne client a été créé avec succès",
        });
        
        // Refresh data
        await fetchAccountData();
        await fetchTransactionHistory();
        
        return true;
      } else {
        throw new Error("Échec de la création du compte");
      }
    } catch (error: any) {
      console.error('Error ensuring savings account:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer le compte client: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, activeSfdId, toast, fetchAccountData, fetchTransactionHistory]);

  // Load data on component mount
  useEffect(() => {
    if (clientId) {
      fetchAccountData();
      fetchTransactionHistory();
    }
  }, [clientId, fetchAccountData, fetchTransactionHistory]);

  return {
    account,
    transactions,
    isLoading,
    isTransactionLoading,
    processDeposit,
    processWithdrawal,
    createAccount,
    ensureSavingsAccount,
    refreshData: fetchAccountData,
    balance: account?.balance || 0,
  };
}
