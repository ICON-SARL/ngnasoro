
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
      
      const { data, error } = await supabase.functions.invoke('client-accounts', {
        body: {
          action: 'getBalance',
          clientId
        }
      });
      
      if (error) throw error;
      return data;
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
      
      const { data, error } = await supabase.functions.invoke('client-accounts', {
        body: {
          action: 'updateBalance',
          clientId,
          amount,
          description: description || (amount > 0 ? 'Crédit manuel' : 'Débit manuel'),
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
        description: 'Le compte client a été mis à jour avec succès.',
        variant: 'default',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Erreur lors de l\'opération sur le compte',
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
      
      const { data, error } = await supabase.functions.invoke('client-accounts', {
        body: {
          action: 'getTransactions',
          clientId,
          limit: 10
        }
      });
      
      if (error) throw error;
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
    refetchBalance
  };
}
