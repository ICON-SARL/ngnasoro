
import { useState, useEffect, useCallback } from 'react';
import { useSfdSynchronization } from './sfd/useSfdSynchronization';
import { useToast } from './use-toast';

// Intervalle de synchronisation en millisecondes (15 minutes)
const SYNC_INTERVAL = 15 * 60 * 1000;

export function useAutoSynchronization(sfdId: string | null) {
  const [lastAutoSync, setLastAutoSync] = useState<Date | null>(null);
  const { toast } = useToast();
  const { synchronizeWithSfd, isSyncing } = useSfdSynchronization(sfdId);

  const performSync = useCallback(async () => {
    if (!sfdId || isSyncing) return;

    try {
      const success = await synchronizeWithSfd();
      if (success) {
        setLastAutoSync(new Date());
        console.log('Auto-synchronisation réussie:', new Date().toISOString());
      }
    } catch (error) {
      console.error('Erreur lors de l\'auto-synchronisation:', error);
      toast({
        title: "Erreur de synchronisation automatique",
        description: "La synchronisation automatique a échoué. Réessayez manuellement.",
        variant: "destructive"
      });
    }
  }, [sfdId, isSyncing, synchronizeWithSfd, toast]);

  // Démarrer la synchronisation automatique
  useEffect(() => {
    // Première synchronisation au chargement
    performSync();

    // Configurer l'intervalle de synchronisation
    const intervalId = setInterval(performSync, SYNC_INTERVAL);

    return () => {
      clearInterval(intervalId);
    };
  }, [performSync]);

  return {
    lastAutoSync,
    performSync
  };
}
