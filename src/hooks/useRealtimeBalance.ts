
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { realtimeBalanceService } from '@/services/realtimeBalanceService';

export function useRealtimeBalance(initialBalance: number = 0, accountId?: string) {
  const [balance, setBalance] = useState<number>(initialBalance);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  // Handle balance updates
  const handleBalanceUpdate = useCallback((newBalance: number, updatedAccountId: string) => {
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

  // Subscribe to realtime updates
  useEffect(() => {
    if (!user?.id) return;
    
    const unsubscribe = realtimeBalanceService.subscribeToBalanceUpdates(
      user.id,
      activeSfdId,
      handleBalanceUpdate
    );
    
    return () => {
      unsubscribe();
    };
  }, [user?.id, activeSfdId, handleBalanceUpdate]);

  // Return the current balance and last update time
  return {
    balance,
    lastUpdated,
    isLive: !!user?.id  // Whether the balance is being updated in real-time
  };
}
