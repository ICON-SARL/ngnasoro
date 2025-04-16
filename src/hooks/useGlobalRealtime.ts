
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { RealtimeChannel } from '@supabase/supabase-js';

export function useGlobalRealtime() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  
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
            broadcast: { self: true }
          }
        });
        
        // Set up event handlers
        newChannel
          .on('presence', { event: 'sync' }, () => {
            console.log('Presence sync event received');
            setIsConnected(true);
          })
          .on('presence', { event: 'join' }, ({ key, newPresences }) => {
            console.log('Presence join:', key, newPresences);
          })
          .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
            console.log('Presence leave:', key, leftPresences);
          })
          .on('broadcast', { event: 'notification' }, (payload) => {
            console.log('Received notification:', payload);
            handleNotification(payload);
          });
        
        // Subscribe to the channel
        newChannel.subscribe((status) => {
          console.log(`Channel status: ${status}`);
          if (status === 'SUBSCRIBED') {
            setIsConnected(true);
          } else {
            setIsConnected(false);
          }
        });
        
        // Setup database change subscription
        // NOTE: Fixing the error by using correct channel type syntax
        supabase
          .channel('schema-db-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`
          }, (payload) => {
            console.log('Database change detected:', payload);
            if (payload.new && payload.new.user_id === user.id) {
              handleDatabaseNotification(payload.new);
            }
          })
          .subscribe();
          
        setChannel(newChannel);
      } catch (error) {
        console.error('Error setting up realtime channel:', error);
      }
    };
    
    setupChannel();
    
    // Cleanup on unmount
    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [user]);
  
  // Handle notifications received via broadcast
  const handleNotification = useCallback((payload: any) => {
    const { title, message, type } = payload;
    if (title && message) {
      toast({
        title,
        description: message,
        variant: type === 'error' ? 'destructive' : type === 'success' ? 'default' : 'secondary'
      });
    }
  }, [toast]);
  
  // Handle notifications from database changes
  const handleDatabaseNotification = useCallback((notification: any) => {
    if (notification && notification.title) {
      toast({
        title: notification.title,
        description: notification.message || notification.description,
        variant: notification.type === 'error' ? 'destructive' : 
                notification.type === 'success' ? 'default' : 'secondary'
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
    sendBroadcast
  };
}
