
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export function useRealtimeSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // Set up realtime subscription
    const channel = supabase.channel('sync_status')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public' },
        (payload) => {
          console.log('Realtime update received:', payload);
          setLastSynced(new Date().toISOString());
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const synchronizeWithSfd = async () => {
    console.log('Starting SFD synchronization...');
    setIsSyncing(true);
    setSyncError(null);

    try {
      const startTime = performance.now();
      
      // Test the connection first
      const connectionStatus = await testConnection();
      if (!connectionStatus.ok) {
        throw new Error('La connexion au serveur a échoué');
      }

      // Simulate sync process (replace with actual sync logic)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const endTime = performance.now();
      console.log(`Synchronization completed in ${Math.round(endTime - startTime)}ms`);
      
      setLastSynced(new Date().toISOString());
      setRetryCount(0);
    } catch (error: any) {
      console.error('Sync error:', error);
      setSyncError(error.message || 'Erreur de synchronisation');
      setRetryCount(prev => prev + 1);
      
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Une erreur est survenue lors de la synchronisation",
        variant: "destructive",
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const testConnection = async () => {
    console.log('Testing connection...');
    try {
      const { data, error } = await supabase.from('sfds').select('id').limit(1);
      
      if (error) throw error;
      
      console.log('Connection test successful');
      return { ok: true };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { ok: false, error };
    }
  };

  return {
    synchronizeWithSfd,
    isSyncing,
    lastSynced,
    syncError,
    retryCount,
    testConnection
  };
}
