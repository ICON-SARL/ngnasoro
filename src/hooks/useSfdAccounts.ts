
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export interface SfdAccountDisplay {
  id: string;
  name: string;
  code?: string;
  logoUrl?: string | null;
  balance?: number; 
  currency?: string;
  isDefault?: boolean;
  isVerified?: boolean;
  sfd_id?: string;
  account_type?: string;
}

export function useSfdAccounts() {
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch SFD accounts associated with the user
  const { 
    data: sfdAccounts = [],
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['user-sfds', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      try {
        // First get all SFDs the user has access to
        const { data: userSfds, error: sfdsError } = await supabase
          .from('user_sfds')
          .select(`
            sfd_id,
            is_default,
            sfds:sfd_id (
              id, 
              name,
              code,
              logo_url
            )
          `)
          .eq('user_id', user.id);
          
        if (sfdsError) throw sfdsError;
        if (!userSfds || userSfds.length === 0) return [];
        
        // Then get all accounts for this user
        const { data: accounts, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id);
          
        if (accountsError) throw accountsError;
        
        // Map SFDs to accounts or create placeholder accounts
        return userSfds.map(userSfd => {
          const sfdData = userSfd.sfds as any;
          // Find matching account or use default values
          const matchingAccount = accounts?.find(acc => acc.sfd_id === userSfd.sfd_id) || null;
          
          return {
            id: userSfd.sfd_id,
            sfd_id: userSfd.sfd_id,
            name: sfdData.name,
            code: sfdData.code,
            logoUrl: sfdData.logo_url,
            balance: matchingAccount?.balance || 0,
            currency: matchingAccount?.currency || 'FCFA',
            isDefault: userSfd.is_default,
            isVerified: true, // Assume verified for now
            account_type: matchingAccount ? 'main' : null
          };
        });
      } catch (err: any) {
        console.error('Error fetching SFD accounts:', err);
        toast({
          title: 'Erreur',
          description: 'Impossible de récupérer vos comptes SFD.',
          variant: 'destructive',
        });
        return [];
      }
    },
    enabled: !!user?.id,
  });
  
  // Get the active savings account if there is an active SFD
  const {
    data: savingsAccount,
    isLoading: isSavingsLoading,
    refetch: refetchSavingsAccount
  } = useQuery({
    queryKey: ['active-savings', activeSfdId, user?.id],
    queryFn: async () => {
      if (!user?.id || !activeSfdId) return null;
      
      try {
        // Get the account for the active SFD
        const { data, error } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', user.id)
          .eq('sfd_id', activeSfdId)
          .maybeSingle();
          
        if (error) throw error;
        
        if (!data) {
          // Try to synchronize with the server
          const { error: syncError } = await supabase.functions.invoke('synchronize-sfd-accounts', {
            body: { userId: user.id, sfdId: activeSfdId, forceFullSync: true }
          });
          
          if (syncError) throw syncError;
          
          // Try to fetch again after sync
          const { data: syncedData, error: fetchError } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', user.id)
            .eq('sfd_id', activeSfdId)
            .maybeSingle();
            
          if (fetchError) throw fetchError;
          return syncedData;
        }
        
        return data;
      } catch (err: any) {
        console.error('Error fetching active savings account:', err);
        return null;
      }
    },
    enabled: !!user?.id && !!activeSfdId,
  });
  
  // Function to synchronize accounts with the server
  const synchronizeAccounts = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: { userId: user.id }
      });
      
      if (error) throw error;
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['user-sfds', user.id] });
      queryClient.invalidateQueries({ queryKey: ['active-savings', activeSfdId, user.id] });
      
      return data?.syncedAccounts || [];
    } catch (err: any) {
      console.error('Failed to synchronize accounts:', err);
      toast({
        title: 'Synchronisation échouée',
        description: 'Impossible de synchroniser vos comptes. Veuillez réessayer.',
        variant: 'destructive',
      });
      return [];
    }
  };
  
  // Use this effect to synchronize once on component mount
  useEffect(() => {
    if (user?.id && !isLoading && sfdAccounts.length === 0) {
      synchronizeAccounts();
    }
  }, [user?.id, isLoading]);
  
  return {
    accounts: sfdAccounts, 
    sfdAccounts,
    isLoading,
    error,
    refetch,
    synchronizeAccounts,
    savingsAccount,
    isSavingsLoading,
    refetchSavingsAccount
  };
}
