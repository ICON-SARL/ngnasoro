
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export interface ClientAccount {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  last_updated?: string;
  sfd_id?: string;
}

export interface ClientTransaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  description?: string;
  created_at: string;
  name?: string;
}

export function useClientSavingsAccount(clientId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId, user } = useAuth();
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  
  // Get client details
  const clientQuery = useQuery({
    queryKey: ['client', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      const { data, error } = await supabase
        .from('sfd_clients')
        .select('*')
        .eq('id', clientId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!clientId
  });
  
  // Get client account details
  const accountQuery = useQuery({
    queryKey: ['client-account', clientId, clientQuery.data?.user_id],
    queryFn: async () => {
      if (!clientId || !clientQuery.data?.user_id) return null;
      
      try {
        // Fetch all accounts for this user
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', clientQuery.data.user_id);
          
        if (error) throw error;
        
        // If multiple accounts exist, return the one matching the active SFD if possible
        if (data && data.length > 0) {
          if (data.length === 1) {
            return data[0];
          } else if (activeSfdId) {
            // Try to find an account matching the active SFD
            const sfdAccount = data.find(acc => acc.sfd_id === activeSfdId);
            if (sfdAccount) return sfdAccount;
          }
          // Default to first account if no matching SFD account found
          return data[0];
        }
        
        return null;
      } catch (error) {
        console.error("Error fetching client account:", error);
        return null;
      }
    },
    enabled: !!clientId && !!clientQuery.data?.user_id
  });
  
  // Get transaction history
  const transactionsQuery = useQuery({
    queryKey: ['client-transactions', clientId, clientQuery.data?.user_id],
    queryFn: async () => {
      if (!clientId || !clientQuery.data?.user_id) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientQuery.data.user_id)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      return data || [];
    },
    enabled: !!clientId && !!clientQuery.data?.user_id && !!accountQuery.data?.id
  });
  
  // Create savings account if doesn't exist
  const ensureSavingsAccount = async () => {
    if (!clientId || !activeSfdId) {
      toast({
        title: "Erreur",
        description: "Informations manquantes pour créer un compte",
        variant: "destructive"
      });
      return null;
    }
    
    try {
      setIsCreatingAccount(true);
      
      console.log("Ensuring savings account for client:", clientId);
      const { data, error } = await supabase.functions.invoke('ensure-client-savings', {
        body: {
          clientId,
          sfdId: activeSfdId
        }
      });
      
      if (error) {
        console.error("Error ensuring savings account:", error);
        throw new Error(error.message || "Impossible de créer un compte épargne");
      }
      
      if (!data.success) {
        throw new Error(data.error || "Impossible de créer un compte épargne");
      }
      
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client', clientId] });
      await clientQuery.refetch();
      await accountQuery.refetch();
      
      toast({
        title: data.accountExists ? "Compte existant" : "Compte créé",
        description: data.accountExists 
          ? "Le compte épargne existe déjà pour ce client" 
          : "Le compte épargne a été créé avec succès",
        variant: "default",
      });
      
      return data.account;
    } catch (error: any) {
      console.error("Error creating savings account:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer un compte épargne pour ce client",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsCreatingAccount(false);
    }
  };
  
  // Process a deposit transaction
  const processDeposit = async (amount: number, description?: string): Promise<boolean> => {
    try {
      if (!clientId || !activeSfdId) {
        toast({
          title: "Erreur",
          description: "Informations manquantes pour effectuer le dépôt",
          variant: "destructive"
        });
        return false;
      }
      
      if (amount <= 0) {
        toast({
          title: "Erreur",
          description: "Le montant doit être supérieur à 0",
          variant: "destructive"
        });
        return false;
      }
      
      if (!clientQuery.data?.user_id) {
        toast({
          title: "Erreur",
          description: "Client non associé à un compte utilisateur",
          variant: "destructive"
        });
        return false;
      }

      const { data, error } = await supabase.functions.invoke('process-account-transaction', {
        body: {
          userId: clientQuery.data.user_id,
          clientId,
          sfdId: activeSfdId,
          amount,
          description,
          transactionType: 'deposit',
          performedBy: user?.id
        }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Échec du dépôt");
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      toast({
        title: "Dépôt effectué",
        description: `${amount} FCFA ont été déposés sur le compte du client`,
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors du dépôt:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'effectuer le dépôt",
        variant: "destructive"
      });
      return false;
    }
  };
  
  // Process a withdrawal
  const processWithdrawal = async (amount: number, description?: string): Promise<boolean> => {
    try {
      if (!clientId || !activeSfdId) {
        toast({
          title: "Erreur",
          description: "Informations manquantes pour effectuer le retrait",
          variant: "destructive"
        });
        return false;
      }
      
      if (amount <= 0) {
        toast({
          title: "Erreur",
          description: "Le montant doit être supérieur à 0",
          variant: "destructive"
        });
        return false;
      }
      
      if (!clientQuery.data?.user_id) {
        toast({
          title: "Erreur",
          description: "Client non associé à un compte utilisateur",
          variant: "destructive"
        });
        return false;
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

      const { data, error } = await supabase.functions.invoke('process-account-transaction', {
        body: {
          userId: clientQuery.data.user_id,
          clientId,
          sfdId: activeSfdId,
          amount,
          description,
          transactionType: 'withdrawal',
          performedBy: user?.id
        }
      });
      
      if (error || !data?.success) {
        throw new Error(error?.message || data?.error || "Échec du retrait");
      }
      
      // Refresh data
      await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      toast({
        title: "Retrait effectué",
        description: `${amount} FCFA ont été retirés du compte du client`,
        variant: "default",
      });
      
      return true;
    } catch (error: any) {
      console.error("Erreur lors du retrait:", error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'effectuer le retrait",
        variant: "destructive"
      });
      return false;
    }
  };
  
  const refreshData = async () => {
    await queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
    await queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
    await clientQuery.refetch();
    await accountQuery.refetch();
    await transactionsQuery.refetch();
  };
  
  return {
    client: clientQuery.data,
    account: accountQuery.data,
    transactions: transactionsQuery.data || [],
    isLoading: clientQuery.isLoading || accountQuery.isLoading || transactionsQuery.isLoading || isCreatingAccount,
    isError: clientQuery.isError || accountQuery.isError || transactionsQuery.isError,
    ensureSavingsAccount,
    processDeposit,
    processWithdrawal,
    refreshData
  };
}
