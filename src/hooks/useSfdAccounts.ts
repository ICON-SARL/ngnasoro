
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface SfdAccount {
  id: string;
  name: string;
  code?: string;
  description?: string;
  logo_url?: string;
  balance: number;
  currency: string;
  status?: string;
  sfds?: {
    id: string;
    name: string;
    logo_url?: string;
  };
  is_default?: boolean;
}

export function useSfdAccounts() {
  const [accounts, setAccounts] = useState<SfdAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  const fetchAccounts = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Fetching SFD accounts and client accounts for user:', user.id);
      
      // First, try to get validated client accounts where the user is a client
      const { data: clientAccounts, error: clientError } = await supabase
        .from('accounts')
        .select(`
          id, 
          balance, 
          currency,
          sfd_id,
          sfds:sfd_id (
            id, 
            name,
            code,
            logo_url
          )
        `)
        .eq('user_id', user.id);
      
      if (clientError) {
        console.error('Error fetching client accounts:', clientError);
        throw clientError;
      }
      
      console.log('Fetched client accounts:', clientAccounts);
      
      // Get user_sfds to determine which SFD is default
      const { data: userSfds } = await supabase
        .from('user_sfds')
        .select('sfd_id, is_default')
        .eq('user_id', user.id);
      
      const userSfdsMap = new Map();
      if (userSfds) {
        userSfds.forEach(us => userSfdsMap.set(us.sfd_id, us.is_default));
      }
      
      // Transform and set the accounts
      const formattedAccounts = (clientAccounts || []).map(account => ({
        id: account.sfds.id,
        name: account.sfds.name,
        code: account.sfds.code,
        logo_url: account.sfds.logo_url,
        balance: account.balance || 0,
        currency: account.currency || 'FCFA',
        status: 'active',
        is_default: userSfdsMap.get(account.sfd_id) || false
      }));
      
      console.log('Formatted accounts:', formattedAccounts);
      setAccounts(formattedAccounts);
      
      setIsLoading(false);
    } catch (err: any) {
      console.error('Error in useSfdAccounts:', err);
      setError(err.message || 'Failed to fetch accounts');
      setIsLoading(false);
      
      toast({
        title: 'Erreur',
        description: 'Impossible de charger vos comptes SFD',
        variant: 'destructive',
      });
    }
  }, [user, toast]);
  
  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts, activeSfdId]);
  
  const synchronizeBalances = useCallback(async () => {
    if (!user) return false;
    
    try {
      // Call the edge function to synchronize balances
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: { userId: user.id, forceFullSync: true }
      });
      
      if (error) throw error;
      
      // Refetch accounts after synchronization
      await fetchAccounts();
      return true;
    } catch (err) {
      console.error('Error synchronizing balances:', err);
      return false;
    }
  }, [user, fetchAccounts]);
  
  return {
    sfdAccounts: accounts,
    isLoading,
    error,
    refetch: fetchAccounts,
    refetchAccounts: fetchAccounts,
    synchronizeBalances
  };
}
