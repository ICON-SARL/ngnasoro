
import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useClientAccountOperations(clientId: string) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  // Get client account balance
  const { 
    data: accountData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['client-account', clientId],
    queryFn: async () => {
      console.log('Fetching account for client:', clientId);
      if (!clientId) throw new Error('Client ID is required');
      
      try {
        // First, get the user_id from sfd_clients
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('user_id, sfd_id')
          .eq('id', clientId)
          .single();
        
        if (clientError || !clientData?.user_id) {
          console.error('Error fetching client data or user_id not found:', clientError);
          throw new Error('Client information not found');
        }
        
        const userId = clientData.user_id;
        const sfdId = clientData.sfd_id;
        
        // Get account information using user_id
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (accountError) {
          console.error('Error fetching account:', accountError);
          
          // Check if account doesn't exist yet
          if (accountError.code === 'PGRST116') { // Not found error
            console.log('Account not found, creating one...');
            
            // Create the account
            setIsCreating(true);
            
            // Call the account creation function
            const { data: newAccountData, error: createError } = await supabase
              .rpc('create_client_savings_account', {
                p_client_id: userId,
                p_sfd_id: sfdId,
                p_initial_balance: 0
              });
            
            setIsCreating(false);
            
            if (createError) {
              console.error('Error creating account:', createError);
              throw new Error(`Failed to create account: ${createError.message}`);
            }
            
            // Fetch the newly created account
            const { data: freshAccount, error: fetchError } = await supabase
              .from('accounts')
              .select('*')
              .eq('user_id', userId)
              .single();
            
            if (fetchError) {
              console.error('Error fetching newly created account:', fetchError);
              throw new Error('Account created but could not be retrieved');
            }
            
            return {
              balance: freshAccount.balance || 0,
              currency: freshAccount.currency || 'FCFA',
              accountId: freshAccount.id
            };
          }
          
          throw new Error(`Failed to fetch account: ${accountError.message}`);
        }
        
        return {
          balance: accountData?.balance || 0,
          currency: accountData?.currency || 'FCFA',
          accountId: accountData?.id
        };
      } catch (err) {
        console.error('Error in account query:', err);
        throw err;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Credit account mutation
  const creditAccount = useMutation({
    mutationFn: async ({ amount, description }: { amount: number, description?: string }) => {
      if (!clientId) throw new Error('Client ID is required');
      if (!amount || amount <= 0) throw new Error('Amount must be positive');
      
      console.log('Processing account operation:', { clientId, amount, description });
      
      try {
        // Get the user_id from sfd_clients
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('user_id, sfd_id')
          .eq('id', clientId)
          .single();
        
        if (clientError || !clientData?.user_id) {
          throw new Error('Client information not found');
        }
        
        const userId = clientData.user_id;
        const sfdId = clientData.sfd_id;
        
        // Create transaction record
        const { data, error } = await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            sfd_id: sfdId,
            amount,
            type: amount >= 0 ? 'deposit' : 'withdrawal',
            name: amount >= 0 ? 'Crédit de compte' : 'Débit de compte',
            description: description || (amount >= 0 ? 'Crédit manuel' : 'Débit manuel'),
            status: 'success'
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // Return the new transaction
        return data;
      } catch (err: any) {
        console.error('Error in credit account mutation:', err);
        throw new Error(`Failed to process transaction: ${err.message}`);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Impossible de traiter l'opération: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    balance: accountData?.balance || 0,
    currency: accountData?.currency || 'FCFA',
    accountId: accountData?.accountId,
    isLoading: isLoading || isCreating,
    error,
    creditAccount,
    refetchBalance: refetch
  };
}
