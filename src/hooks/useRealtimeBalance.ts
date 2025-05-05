
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeBalance(initialBalance: number = 0, sfdId?: string) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();
  const effectiveSfdId = sfdId || activeSfdId;

  // Handle balance updates
  const handleBalanceUpdate = useCallback((newBalance: number) => {
    console.log('Realtime balance update received:', { newBalance, currentBalance: balance });
    
    if (newBalance !== balance) {
      setBalance(newBalance);
      setLastUpdated(new Date());
      
      toast({
        title: 'Solde actualisé',
        description: 'Le solde de votre compte a été mis à jour en temps réel.',
        variant: 'default',
      });
    }
  }, [balance, toast]);

  // Subscribe to realtime updates with improved handling
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Setting up realtime balance subscription for:', { 
      userId: user.id, 
      sfdId: effectiveSfdId 
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
          filter: effectiveSfdId
            ? `user_id=eq.${user.id}&sfd_id=eq.${effectiveSfdId}`
            : `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Balance update received:', payload);
          if (payload.new && typeof payload.new.balance === 'number') {
            handleBalanceUpdate(payload.new.balance);
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
  }, [user?.id, effectiveSfdId, handleBalanceUpdate, initialBalance]);

  // Function to manually refresh the balance
  const refreshBalance = useCallback(async () => {
    if (!user?.id) return balance;
    
    try {
      console.log('Manually refreshing balance...');
      
      let query = supabase
        .from('accounts')
        .select('balance')
        .eq('user_id', user.id);
        
      if (effectiveSfdId) {
        query = query.eq('sfd_id', effectiveSfdId);
      }
      
      const { data, error } = await query.maybeSingle();
      
      if (error) {
        console.error('Error refreshing balance:', error);
        return balance;
      }
      
      if (data && typeof data.balance === 'number') {
        console.log('Manual balance refresh result:', data.balance);
        setBalance(data.balance);
        setLastUpdated(new Date());
        return data.balance;
      }
      
      return balance;
    } catch (error) {
      console.error('Failed to refresh balance:', error);
      return balance;
    }
  }, [user?.id, effectiveSfdId, balance]);

  // Return the current balance and last update time
  return {
    balance,
    lastUpdated,
    isLive: !!user?.id,  // Whether the balance is being updated in real-time
    refreshBalance
  };
}
