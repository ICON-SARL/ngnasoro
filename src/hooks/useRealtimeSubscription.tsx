
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UseRealtimeSubscriptionProps } from '@/types/realtimeTransactions';

export function useRealtimeSubscription({ activeSfdId, onUpdate }: UseRealtimeSubscriptionProps) {
  const createRealtimeSubscription = useCallback((sfdId: string) => {
    // Create a channel with explicit type cast to avoid deep type inference
    const channel = supabase.channel('public:transactions');
    
    channel.on(
      'postgres_changes', 
      { 
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `sfd_id=eq.${sfdId}`
      }, 
      (payload) => {
        // Type the payload as any to avoid deep inference issues
        onUpdate(payload as any);
      }
    );
    
    return channel.subscribe();
  }, [onUpdate]);

  useEffect(() => {
    if (!activeSfdId) return;
    
    const subscription = createRealtimeSubscription(activeSfdId);
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [activeSfdId, createRealtimeSubscription]);
}
