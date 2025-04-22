
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useClientAccountOperations(clientId: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch client account balance
  const { data: accountData, refetch: refetchBalance } = useQuery({
    queryKey: ['client-account-balance', clientId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('accounts')
          .select('balance, currency')
          .eq('user_id', clientId)
          .maybeSingle();
          
        if (error) throw error;
        return {
          balance: data?.balance || 0,
          currency: data?.currency || 'FCFA'
        };
      } catch (error) {
        console.error('Error fetching account balance:', error);
        return {
          balance: 0,
          currency: 'FCFA'
        };
      }
    }
  });
  
  const creditAccount = useMutation({
    mutationFn: async ({ amount, description }: { amount: number; description?: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      setIsLoading(true);
      
      try {
        // First, get the current balance
        const { data: accountData, error: fetchError } = await supabase
          .from('accounts')
          .select('balance')
          .eq('user_id', clientId)
          .maybeSingle();
        
        if (fetchError) throw fetchError;
        
        // Calculate the new balance
        const newBalance = (accountData?.balance || 0) + amount;
        
        // Update the account with the new balance
        const { error: updateError } = await supabase
          .from('accounts')
          .update({ 
            balance: newBalance,
            last_updated: new Date().toISOString()
          })
          .eq('user_id', clientId);
        
        if (updateError) throw updateError;
        
        // Create a transaction record
        const { error: transactionError } = await supabase
          .from('transactions')
          .insert({
            user_id: clientId,
            amount: Math.abs(amount),
            type: amount > 0 ? 'deposit' : 'withdrawal',
            name: amount > 0 ? 'Crédit de compte' : 'Débit de compte',
            description: description || (amount > 0 ? 'Crédit manuel' : 'Débit manuel'),
            payment_method: 'admin_operation',
            status: 'success',
            sfd_id: user.sfd_id // Assuming user object has sfd_id property
          });
        
        if (transactionError) throw transactionError;
        
        // Log the operation in audit logs if available
        try {
          await supabase
            .from('audit_logs')
            .insert({
              user_id: user.id,
              action: amount > 0 ? 'client_account_credited' : 'client_account_debited',
              category: 'SFD_OPERATIONS',
              status: 'success',
              severity: 'info',
              target_resource: `accounts/${clientId}`,
              details: {
                clientId,
                amount,
                previousBalance: accountData?.balance || 0,
                newBalance,
                description
              }
            });
        } catch (auditError) {
          console.error('Error logging to audit:', auditError);
          // Non-critical error, continue operation
        }
        
        return { success: true, newBalance };
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['client-account', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-transactions', clientId] });
      queryClient.invalidateQueries({ queryKey: ['client-account-balance', clientId] });
      
      // Manually refetch the balance
      refetchBalance();
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de l\'opération',
        variant: 'destructive',
      });
    }
  });

  return {
    creditAccount,
    isLoading,
    // Expose balance and currency data
    balance: accountData?.balance || 0,
    currency: accountData?.currency || 'FCFA',
    refetchBalance
  };
}
