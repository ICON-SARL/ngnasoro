
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// Define types for table subscriptions
export type TableSubscription = {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
};

// Define a type for real-time events
export type RealtimeEvent = {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE';
  payload: any;
};

interface NotificationPayload {
  title: string;
  message?: string;
  description?: string;
  type?: 'default' | 'destructive';
}

export function useGlobalRealtime(tableSubscriptions?: TableSubscription[]) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  
  // Initial channel setup
  useEffect(() => {
    if (!user) return;
    
    const setupChannel = async () => {
      try {
        // Clean up any existing channel
        if (channel) {
          await channel.unsubscribe();
        }
        
        // Set up a new channel for the user
        const newChannel = supabase.channel(`user-${user.id}`, {
          config: {
            broadcast: { self: true },
            presence: {
              key: user.id,
            },
          }
        });
        
        // Set up presence handlers
        newChannel
          .on('presence', { event: 'sync' }, () => {
            setIsConnected(true);
          })
          .on('presence', { event: 'join' }, ({ key }) => {
            console.log('Presence join:', key);
          })
          .on('presence', { event: 'leave' }, ({ key }) => {
            console.log('Presence leave:', key);
          });
        
        // Add broadcast handler for notifications
        newChannel.on(
          'broadcast',
          { event: 'notification' },
          (payload) => {
            if (payload.payload && typeof payload.payload === 'object') {
              handleNotification(payload.payload);
            }
          }
        );
        
        // Subscribe to the channel
        const status = await newChannel.subscribe();
        if (status === 'SUBSCRIBED') {
          await newChannel.send({
            type: 'broadcast',
            event: 'notification',
            payload: {
              type: 'default',
              message: 'Channel subscribed successfully'
            }
          });
          setIsConnected(true);
        } else {
          setIsConnected(false);
        }
        
        setChannel(newChannel);
        
        // Setup database change subscription if table subscriptions are provided
        if (tableSubscriptions && tableSubscriptions.length > 0) {
          const dbChannel = supabase.channel('db-changes');
          
          // Add a listener for each table subscription
          tableSubscriptions.forEach(sub => {
            dbChannel.on(
              'postgres_changes',
              {
                event: sub.event,
                schema: 'public',
                table: sub.table,
                filter: sub.filter || `user_id=eq.${user.id}`
              },
              (payload: RealtimePostgresChangesPayload<any>) => {
                console.log(`Database change detected in ${sub.table}:`, payload);
                
                if (payload.new && typeof payload.new === 'object') {
                  const payloadData = payload.new as Record<string, any>;
                  if (!('user_id' in payloadData) || payloadData.user_id === user.id) {
                    setEvents(prev => [...prev, {
                      table: sub.table,
                      event: payload.eventType as any,
                      payload: payload.new
                    }]);
                    
                    if (sub.table === 'notifications') {
                      handleDatabaseNotification(payload.new);
                    }
                  }
                }
              }
            );
          });
          
          dbChannel.subscribe();
        }
      } catch (error) {
        console.error('Error setting up realtime channel:', error);
      }
    };
    
    setupChannel();
    
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user, tableSubscriptions]);
  
  // Handle notifications received via broadcast
  const handleNotification = useCallback((payload: NotificationPayload) => {
    const { title, message, type } = payload;
    if (title && (message || payload.description)) {
      toast({
        title,
        description: message || payload.description,
        variant: type || 'default'
      });
    }
  }, [toast]);
  
  // Handle notifications from database changes
  const handleDatabaseNotification = useCallback((notification: any) => {
    if (notification && notification.title) {
      toast({
        title: notification.title,
        description: notification.message || notification.description,
        variant: (notification.type === 'error' ? 'destructive' : 'default')
      });
    }
  }, [toast]);
  
  // Send a broadcast message to the channel
  const sendBroadcast = useCallback((event: string, payload: any) => {
    if (!channel || !isConnected) {
      console.warn('Cannot send broadcast: channel not connected');
      return false;
    }
    
    try {
      channel.send({
        type: 'broadcast',
        event,
        payload
      });
      return true;
    } catch (error) {
      console.error('Error sending broadcast:', error);
      return false;
    }
  }, [channel, isConnected]);
  
  return {
    isConnected,
    sendBroadcast,
    events
  };
}
