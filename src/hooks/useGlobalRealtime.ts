
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export interface RealtimeEvent<T = any> {
  table: string;
  schema: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
}

export type TableSubscription = {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
};

/**
 * Hook for global real-time updates across multiple tables
 */
export function useGlobalRealtime(subscriptions: TableSubscription[] = []) {
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  // Handle real-time events
  const handleRealtimeEvent = useCallback((payload: RealtimeEvent) => {
    // Add the event to our list of events
    setEvents(prevEvents => [payload, ...prevEvents].slice(0, 50)); // Keep only last 50 events
    setLastUpdated(new Date());
    
    // Log the event for debugging
    console.log(`[Realtime] ${payload.event} on ${payload.schema}.${payload.table}`, payload);
  }, []);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!user?.id || subscriptions.length === 0) return;

    // Create a channel for all subscriptions
    const channel: RealtimeChannel = supabase.channel('global-realtime');
    
    // Add all subscriptions to the channel
    subscriptions.forEach(subscription => {
      let filter = subscription.filter || '';
      
      // Add user filter if none specified
      if (!filter && user?.id) {
        filter = `user_id=eq.${user.id}`;
      }
      
      // Add SFD filter if available
      if (activeSfdId && !filter.includes('sfd_id')) {
        filter = filter ? `${filter}&sfd_id=eq.${activeSfdId}` : `sfd_id=eq.${activeSfdId}`;
      }
      
      // Use the correct method signature with proper types
      channel.on(
        'postgres_changes', 
        { 
          event: subscription.event, 
          schema: 'public',
          table: subscription.table,
          filter: filter || undefined
        }, 
        handleRealtimeEvent
      );
    });
    
    // Track channel status using subscription callback
    channel.subscribe((status) => {
      console.log(`[Realtime] Subscription status: ${status}`);
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        console.log('[Realtime] Connected to global channel');
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setIsConnected(false);
        console.log('[Realtime] Disconnected from global channel');
      }
    });
    
    // Cleanup on unmount
    return () => {
      console.log('[Realtime] Cleaning up global channel');
      supabase.removeChannel(channel);
    };
  }, [user?.id, activeSfdId, handleRealtimeEvent, subscriptions]);

  // Method to clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  return {
    events,
    lastUpdated,
    isConnected,
    clearEvents
  };
}
