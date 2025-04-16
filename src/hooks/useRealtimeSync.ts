
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface RealtimeSyncConfig {
  table: string;
  onInsert?: (payload: any) => void;
  onUpdate?: (payload: any) => void;
  onDelete?: (payload: any) => void;
  filter?: string;
}

export function useRealtimeSync(config: RealtimeSyncConfig) {
  const { toast } = useToast();

  useEffect(() => {
    console.log(`Setting up realtime sync for ${config.table}`);

    const channel = supabase
      .channel('db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: config.table,
          filter: config.filter
        },
        (payload) => {
          console.log(`Realtime event received for ${config.table}:`, payload);

          switch (payload.eventType) {
            case 'INSERT':
              config.onInsert?.(payload.new);
              break;
            case 'UPDATE':
              config.onUpdate?.(payload.new);
              break;
            case 'DELETE':
              config.onDelete?.(payload.old);
              break;
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Realtime subscription active for ${config.table}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Realtime subscription error for ${config.table}`);
          toast({
            title: "Erreur de synchronisation",
            description: "La mise à jour en temps réel n'est pas disponible actuellement",
            variant: "destructive"
          });
        }
      });

    return () => {
      console.log(`Cleaning up realtime sync for ${config.table}`);
      supabase.removeChannel(channel);
    };
  }, [config.table, config.filter]);
}
