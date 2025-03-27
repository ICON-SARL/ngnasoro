
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UseRealtimeSubscriptionProps } from '@/types/realtimeTransactions';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useRealtimeSubscription({ activeSfdId, onUpdate }: UseRealtimeSubscriptionProps) {
  const createRealtimeSubscription = useCallback((sfdId: string) => {
    // Use the correct RealtimeChannel type from Supabase library
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
