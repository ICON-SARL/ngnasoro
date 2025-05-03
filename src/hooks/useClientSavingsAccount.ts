
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
      // First get the user_id from the client record
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (!client?.user_id) {
        setAccount(null);
        return;
      }

      // Then get the account using user_id
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', client.user_id)
        .maybeSingle();
      
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
    
    try {
      // First get the user_id from the client record
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (!client?.user_id) {
        setTransactions([]);
        return;
      }
      
      // Fetch transactions for this user_id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', client.user_id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      
      setTransactions(data || []);
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
      // First get the user_id from the client record
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (!client?.user_id) {
        toast({
          title: "Erreur",
          description: "Client non trouvé ou compte utilisateur non associé",
          variant: "destructive",
        });
        return false;
      }
      
      // Create deposit transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: client.user_id,
          amount: amount,
          name: 'Dépôt',
          description: description || 'Dépôt sur compte client',
          type: 'deposit',
          status: 'success',
          sfd_id: activeSfdId
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
  }, [clientId, toast, fetchAccountData, fetchTransactionHistory, activeSfdId]);

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
      // First get the user_id from the client record
      const { data: client } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
      
      if (!client?.user_id) {
        toast({
          title: "Erreur",
          description: "Client non trouvé ou compte utilisateur non associé",
          variant: "destructive",
        });
        return false;
      }
      
      // Create withdrawal transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: client.user_id,
          amount: -amount, // Negative amount for withdrawal
          name: 'Retrait',
          description: description || 'Retrait du compte client',
          type: 'withdrawal',
          status: 'success',
          sfd_id: activeSfdId
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
