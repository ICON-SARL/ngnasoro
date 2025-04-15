
import { supabase } from '@/integrations/supabase/client';

type BalanceUpdateListener = (newBalance: number, accountId: string) => void;

export const realtimeBalanceService = {
  /**
   * Subscribe to real-time balance updates
   * @param userId The user ID to subscribe for
   * @param sfdId The SFD ID to filter by (optional)
   * @param listener Callback function when balance changes
   * @returns Cleanup function to unsubscribe
   */
  subscribeToBalanceUpdates(userId: string, sfdId: string | undefined, listener: BalanceUpdateListener) {
    if (!userId) {
      console.error('Cannot subscribe to balance updates: No user ID provided');
      return () => {};
    }

    console.log(`Subscribing to balance updates for user ${userId}${sfdId ? ` and SFD ${sfdId}` : ''}`);
    
    // Create a channel for realtime subscriptions
    const channel = supabase
      .channel('account-balance-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'accounts',
          filter: `user_id=eq.${userId}${sfdId ? `&sfd_id=eq.${sfdId}` : ''}`
        },
        (payload) => {
          console.log('Balance update received:', payload);
          if (payload.new && typeof payload.new.balance === 'number') {
            listener(payload.new.balance, payload.new.id);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'sfd_accounts',
          filter: sfdId ? `sfd_id=eq.${sfdId}` : undefined
        },
        (payload) => {
          console.log('SFD account balance update received:', payload);
          if (payload.new && typeof payload.new.balance === 'number') {
            listener(payload.new.balance, payload.new.id);
          }
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      console.log('Unsubscribing from balance updates');
      supabase.removeChannel(channel);
    };
  }
};
