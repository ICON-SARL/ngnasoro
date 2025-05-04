
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeBalance(initialBalance: number = 0, accountId?: string) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  // Handle balance updates
  const handleBalanceUpdate = useCallback((newBalance: number, updatedAccountId: string) => {
    console.log('Realtime balance update received:', { newBalance, updatedAccountId, accountId });
    
    // Update if either we're watching this specific account, or all accounts
    if (!accountId || accountId === updatedAccountId) {
      setBalance(newBalance);
      setLastUpdated(new Date());
      
      toast({
        title: 'Solde actualisé',
        description: 'Le solde de votre compte a été mis à jour en temps réel.',
        variant: 'default',
      });
    }
  }, [accountId, toast]);

  // Subscribe to realtime updates with improved handling
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Setting up realtime balance subscription for:', { 
      userId: user.id, 
      accountId, 
      activeSfdId 
    });
    
    // Create a channel for realtime subscriptions
    const channel = supabase
      .channel('account-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'accounts',
          filter: accountId 
            ? `id=eq.${accountId}` 
            : `user_id=eq.${user.id}${activeSfdId ? `&sfd_id=eq.${activeSfdId}` : ''}`
        },
        (payload) => {
          console.log('Balance update received:', payload);
          if (payload.new && typeof payload.new.balance === 'number') {
            handleBalanceUpdate(payload.new.balance, payload.new.id);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    // Set initial balance if provided
    if (initialBalance !== undefined && initialBalance > 0) {
      setBalance(initialBalance);
    }
    
    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from balance updates');
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeSfdId, accountId, handleBalanceUpdate, initialBalance]);

  // Return the current balance and last update time
  return {
    balance,
    lastUpdated,
    isLive: !!user?.id  // Whether the balance is being updated in real-time
  };
}
