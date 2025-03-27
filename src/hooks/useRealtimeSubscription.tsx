
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UseRealtimeSubscriptionProps } from '@/types/realtimeTransactions';

// Define interface for channel to avoid deep inference
interface SupabaseChannel {
  on: (event: string, config: any, callback: (payload: any) => void) => SupabaseChannel;
  subscribe: () => SupabaseChannel;
}

export function useRealtimeSubscription({ activeSfdId, onUpdate }: UseRealtimeSubscriptionProps) {
  const createRealtimeSubscription = useCallback((sfdId: string) => {
    // Cast the channel to our simple interface
    const channel = supabase.channel('public:transactions') as unknown as SupabaseChannel;
    
    channel.on(
      'postgres_changes', 
      { 
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `sfd_id=eq.${sfdId}`
      }, 
      (payload) => {
        // Pass the payload directly without type inference
        onUpdate(payload);
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
