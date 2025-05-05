
import { useState, useCallback, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface CreditDebitParams {
  amount: number;
  description?: string;
}

export function useClientAccountOperations(clientId: string) {
  const [balance, setBalance] = useState<number>(0);
  const [currency, setCurrency] = useState<string>('FCFA');
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get client balance
  const { 
    data: accountData, 
    isLoading,
    refetch
  } = useQuery({
    queryKey: ['client-account', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      // First, get the user_id associated with this client
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id, sfd_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !clientData?.user_id) {
        console.error('Error fetching client data:', clientError);
        return { balance: 0, currency: 'FCFA' };
      }
      
      // Then get the account using the user_id
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientData.user_id)
        .eq('sfd_id', clientData.sfd_id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching account data:', error);
        return { balance: 0, currency: 'FCFA' };
      }
      
      // If no account exists, return default values
      if (!data) {
        return { balance: 0, currency: 'FCFA' };
      }
      
      return {
        balance: data.balance || 0,
        currency: data.currency || 'FCFA',
        id: data.id,
        userId: data.user_id,
        sfdId: data.sfd_id
      };
    },
    enabled: !!clientId
  });

  // Update local state when accountData changes
  useEffect(() => {
    if (accountData) {
      setBalance(accountData.balance || 0);
      setCurrency(accountData.currency || 'FCFA');
    }
  }, [accountData]);

  // Credit/debit client account
  const creditAccount = useMutation({
    mutationFn: async ({ amount, description }: CreditDebitParams) => {
      if (!clientId || !user) throw new Error('Missing client ID or user');
      
      // Call the Edge Function to process the transaction
      const { data, error } = await supabase.functions.invoke('process-account-transaction', {
        body: {
          clientId,
          amount,
          transactionType: 'deposit',
          description: description || 'Crédit manuel',
          performedBy: user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      toast({
        title: 'Opération réussie',
        description: 'Le compte client a été crédité avec succès.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du crédit du compte',
        variant: 'destructive',
      });
    }
  });

  // Debit client account
  const debitAccount = useMutation({
    mutationFn: async ({ amount, description }: CreditDebitParams) => {
      if (!clientId || !user) throw new Error('Missing client ID or user');
      
      // Call the Edge Function to process the transaction
      const { data, error } = await supabase.functions.invoke('process-account-transaction', {
        body: {
          clientId,
          amount,
          transactionType: 'withdrawal',
          description: description || 'Débit manuel',
          performedBy: user.id
        }
      });
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      
      toast({
        title: 'Opération réussie',
        description: 'Le compte client a été débité avec succès.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors du débit du compte',
        variant: 'destructive',
      });
    }
  });

  // Get transaction history
  const { 
    data: transactions = [], 
    isLoading: isLoadingTransactions
  } = useQuery({
    queryKey: ['client-transactions', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      // First, get the user_id associated with this client
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !clientData?.user_id) {
        console.error('Error fetching client user_id:', clientError);
        return [];
      }
      
      // Then get transactions using the user_id
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientData.user_id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) {
        console.error('Error fetching transactions:', error);
        return [];
      }
      
      return data || [];
    },
    enabled: !!clientId
  });

  // Manual refresh function
  const refetchBalance = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return {
    balance,
    currency,
    isLoading,
    transactions,
    isLoadingTransactions,
    creditAccount,
    debitAccount,
    refetchBalance
  };
}
