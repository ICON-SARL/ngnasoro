
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeBalance(initialBalance: number = 0, accountId?: string) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  // Handle balance updates
  const handleBalanceUpdate = useCallback((payload: any) => {
    // Check if the update is for the correct account
    if (payload.new && (!accountId || payload.new.id === accountId)) {
      const newBalance = payload.new.balance;
      
      // Only update if balance has actually changed
      if (newBalance !== balance) {
        setBalance(newBalance);
        setLastUpdated(new Date());
        
        toast({
          title: 'Solde actualisé',
          description: 'Le solde de votre compte a été mis à jour en temps réel.',
          variant: 'default',
        });
      }
    }
  }, [accountId, balance, toast]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;

    // Create a channel for account balance changes
    const channel = supabase
      .channel('account-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${user.id}${activeSfdId ? `&sfd_id=eq.${activeSfdId}` : ''}`
        },
        handleBalanceUpdate
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeSfdId, handleBalanceUpdate]);

  // Return the current balance and last update time
  return {
    balance,
    lastUpdated,
    isLive: !!user?.id  // Whether the balance is being updated in real-time
  };
}
