
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface RealtimeSyncOptions {
  table: string;
  filter?: string;
  onInsert?: (item: any) => void;
  onUpdate?: (item: any) => void;
  onDelete?: (item: any) => void;
  schema?: string;
}

export function useRealtimeSync({
  table,
  filter,
  onInsert,
  onUpdate,
  onDelete,
  schema = 'public'
}: RealtimeSyncOptions) {
  useEffect(() => {
    console.log(`Setting up realtime sync for ${schema}.${table}${filter ? ` with filter: ${filter}` : ''}`);
    
    // Construire l'ID du canal avec le filtre si présent
    const channelId = `${table}${filter ? `-${filter}` : ''}`;
    
    // S'abonner aux notifications du canal
    const channel = supabase
      .channel(channelId)
      .on('postgres_changes', {
        event: 'INSERT',
        schema,
        table,
        filter
      }, (payload) => {
        console.log('INSERT event received:', payload);
        onInsert?.(payload.new);
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema,
        table,
        filter
      }, (payload) => {
        console.log('UPDATE event received:', payload);
        onUpdate?.(payload.new);
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema,
        table,
        filter
      }, (payload) => {
        console.log('DELETE event received:', payload);
        onDelete?.(payload.old);
      })
      .subscribe((status) => {
        console.log(`Realtime subscription status for ${channelId}:`, status);
      });
    
    // Nettoyer l'abonnement quand le composant est démonté
    return () => {
      console.log(`Cleaning up realtime sync for ${channelId}`);
      supabase.removeChannel(channel);
    };
  }, [table, filter, onInsert, onUpdate, onDelete, schema]);
}
