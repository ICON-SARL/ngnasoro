
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSyncProps {
  table: string;
  filter?: string;
  onInsert?: (newRecord: any) => void;
  onUpdate?: (updatedRecord: any) => void;
  onDelete?: (deletedRecord: any) => void;
}

export function useRealtimeSync({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete
}: RealtimeSyncProps) {
  useEffect(() => {
    // Build the channel name with optional filter
    let channelName = `realtime:public:${table}`;
    if (filter) {
      channelName += `:${filter}`;
    }
    
    // Create the subscription
    const channel = supabase
      .channel(channelName);
    
    // Add event handlers
    if (onInsert) {
      channel.on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: table,
        filter: filter ? { filter } : undefined 
      }, (payload) => {
        console.log(`New ${table} record inserted:`, payload.new);
        onInsert(payload.new);
      });
    }
    
    if (onUpdate) {
      channel.on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: table,
        filter: filter ? { filter } : undefined 
      }, (payload) => {
        console.log(`${table} record updated:`, payload.new);
        onUpdate(payload.new);
      });
    }
    
    if (onDelete) {
      channel.on('postgres_changes', { 
        event: 'DELETE', 
        schema: 'public', 
        table: table,
        filter: filter ? { filter } : undefined 
      }, (payload) => {
        console.log(`${table} record deleted:`, payload.old);
        onDelete(payload.old);
      });
    }
    
    // Subscribe to the channel
    channel.subscribe();
      
    // Clean up the subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);
}
