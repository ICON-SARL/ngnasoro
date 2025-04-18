import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAccountSynchronization } from './useAccountSynchronization';
import { useAuth } from '@/hooks/useAuth';

interface ClientAccount {
  id: string;
  balance: number;
  currency: string;
  last_updated: string;
  user_id: string;
}

interface ClientTransaction {
  id: string;
  amount: number;
  type: string;
  description: string;
  created_at: string;
  status: string;
}

export function useClientSavingsAccount(clientId: string) {
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [transactions, setTransactions] = useState<ClientTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  const { toast } = useToast();
  const { synchronizeAccounts } = useAccountSynchronization();
  const { activeSfdId } = useAuth();

  // Fetch account data
  const fetchAccountData = useCallback(async () => {
    if (!clientId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error;
      }
      
      setAccount(data || null);
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
    
    setIsTransactionLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error: any) {
      console.error('Error fetching transaction history:', error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer l'historique des transactions",
        variant: "destructive",
      });
    } finally {
      setIsTransactionLoading(false);
    }
  }, [clientId, toast]);

  // Process a deposit
  const processDeposit = useCallback(async (amount: number, description?: string) => {
    if (!clientId || !amount || amount <= 0) {
      toast({
        title: "Erreur",
        description: "Montant invalide pour le dépôt",
        variant: "destructive",
      });
      return false;
    }
    
    setIsTransactionLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: amount,
          name: 'Dépôt',
          description: description || 'Dépôt sur compte client',
          type: 'deposit',
          status: 'success',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Dépôt effectué",
        description: `${amount} FCFA ont été déposés sur le compte client`,
      });
      
      // Refresh account data and transaction history
      await fetchAccountData();
      await fetchTransactionHistory();
      
      // Synchronize with user app account
      await synchronizeAccounts(clientId);
      
      return true;
    } catch (error: any) {
      console.error('Error processing deposit:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le dépôt",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  }, [clientId, toast, fetchAccountData, fetchTransactionHistory, synchronizeAccounts]);

  // Process a withdrawal
  const processWithdrawal = useCallback(async (amount: number, description?: string) => {
    if (!clientId || !amount || amount <= 0) {
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
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount: -amount, // Negative amount for withdrawal
          name: 'Retrait',
          description: description || 'Retrait du compte client',
          type: 'withdrawal',
          status: 'success',
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Retrait effectué",
        description: `${amount} FCFA ont été retirés du compte client`,
      });
      
      // Refresh account data and transaction history
      await fetchAccountData();
      await fetchTransactionHistory();
      
      // Synchronize with user app account
      await synchronizeAccounts(clientId);
      
      return true;
    } catch (error: any) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'effectuer le retrait",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsTransactionLoading(false);
    }
  }, [clientId, account, toast, fetchAccountData, fetchTransactionHistory, synchronizeAccounts]);

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
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();

      if (!client?.user_id) {
        throw new Error("Le client n'a pas de compte utilisateur associé");
      }

      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: client.user_id,
          sfd_id: activeSfdId,
          balance: initialBalance,
          currency: 'FCFA'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      toast({
        title: "Compte créé",
        description: "Le compte d'épargne client a été créé avec succès",
      });
      
      // Create initial deposit transaction if initial balance > 0
      if (initialBalance > 0) {
        await supabase
          .from('transactions')
          .insert({
            user_id: client.user_id,
            sfd_id: activeSfdId,
            amount: initialBalance,
            type: 'deposit',
            name: 'Dépôt initial',
            description: 'Dépôt initial lors de la création du compte',
            status: 'success'
          });
          
        await fetchTransactionHistory();
      }
      
      // Fetch updated account data
      await fetchAccountData();
      
      return true;
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

  // Synchronize account with user application account
  const syncAccount = useCallback(async () => {
    if (!clientId) return false;
    
    setIsLoading(true);
    try {
      const success = await synchronizeAccounts(clientId);
      if (success) {
        await fetchAccountData();
        await fetchTransactionHistory();
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [clientId, synchronizeAccounts, fetchAccountData, fetchTransactionHistory]);

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
    syncAccount,
    refreshData: fetchAccountData
  };
}
