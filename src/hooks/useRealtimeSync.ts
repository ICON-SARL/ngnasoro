
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
    // Build the channel topic with optional filter
    let topic = `realtime:public:${table}`;
    if (filter) {
      topic += `:${filter}`;
    }
    
    // Create the subscription
    const channel = supabase
      .channel(topic)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: table,
        filter: filter ? { filter } : undefined
      }, (payload) => {
        console.log(`New ${table} record inserted:`, payload.new);
        if (onInsert) onInsert(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: table,
        filter: filter ? { filter } : undefined
      }, (payload) => {
        console.log(`${table} record updated:`, payload.new);
        if (onUpdate) onUpdate(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: table,
        filter: filter ? { filter } : undefined
      }, (payload) => {
        console.log(`${table} record deleted:`, payload.old);
        if (onDelete) onDelete(payload.old);
      })
      .subscribe();
      
    // Clean up the subscription when component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert, onUpdate, onDelete]);
}
