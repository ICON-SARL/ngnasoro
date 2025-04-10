
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export type SavingsTransactionOptions = {
  clientId: string;
  amount: number;
  description?: string;
  adminId: string;
  transactionType: 'deposit' | 'withdrawal' | 'loan_disbursement' | 'loan_repayment';
  referenceId?: string;
};

export function useSavingsAccount(clientId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Get client account details
  const accountQuery = useQuery({
    queryKey: ['client-account', clientId],
    queryFn: async () => {
      if (!clientId) return null;
      
      const { data, error } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
        
      if (error && error.code !== 'PGRST116') {
        throw error;
      }
      
      return data;
    },
    enabled: !!clientId
  });
  
  // Get transaction history
  const transactionsQuery = useQuery({
    queryKey: ['client-transactions', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', clientId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      return data || [];
    },
    enabled: !!clientId
  });
  
  // Create savings account if doesn't exist
  const createAccount = useMutation({
    mutationFn: async ({ sfdId, initialBalance = 0 }: { sfdId: string, initialBalance?: number }) => {
      if (!clientId) throw new Error('Client ID is required');
      
      // First check if account already exists
      const { data: existingAccount } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', clientId)
        .single();
        
      if (existingAccount) {
        return existingAccount;
      }
      
      // Create new account
      const { data, error } = await supabase
        .from('accounts')
        .insert({
          user_id: clientId,
          balance: initialBalance,
          currency: 'FCFA',
          sfd_id: sfdId
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
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
      
      // Create the transaction
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          user_id: clientId,
          amount,
          type: 'deposit',
          name: 'Dépôt',
          description: description || 'Dépôt en agence',
          status: 'success',
          payment_method: 'sfd_agency'
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
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
  
  return {
    account: accountQuery.data,
    transactions: transactionsQuery.data,
    isLoading: accountQuery.isLoading || transactionsQuery.isLoading,
    isError: accountQuery.isError || transactionsQuery.isError,
    createAccount,
    processDeposit,
    refetch: () => {
      accountQuery.refetch();
      transactionsQuery.refetch();
    }
  };
}
