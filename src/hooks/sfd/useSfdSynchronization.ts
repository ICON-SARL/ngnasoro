
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../useAuth';

export function useSfdSynchronization(sfdId: string | null) {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const synchronizeWithSfd = useCallback(async () => {
    if (!user?.id || !sfdId) {
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser : identifiant SFD ou utilisateur manquant",
        variant: "destructive"
      });
      return false;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      console.log(`Synchronizing data for SFD ${sfdId}`);
      
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: {
          userId: user.id,
          sfdId: sfdId,
          forceSync: true
        }
      });

      if (error) throw error;

      if (data.success) {
        setLastSyncedAt(new Date());
        toast({
          title: "Synchronisation réussie",
          description: "Les données ont été synchronisées avec succès"
        });
        return true;
      } else {
        throw new Error(data.message || "Échec de la synchronisation");
      }
    } catch (error: any) {
      console.error("Error synchronizing with SFD:", error);
      setSyncError(error.message);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Une erreur est survenue lors de la synchronisation",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, sfdId, toast]);

  const testConnection = useCallback(async () => {
    if (!sfdId) {
      toast({
        title: "Erreur",
        description: "Identifiant SFD manquant",
        variant: "destructive"
      });
      return false;
    }

    try {
      const { data, error } = await supabase.functions.invoke('test-sfd-connection', {
        body: { sfdId }
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Test réussi",
          description: "La connexion avec la SFD est opérationnelle"
        });
        return true;
      } else {
        throw new Error(data?.message || "Échec du test de connexion");
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      toast({
        title: "Erreur de connexion",
        description: error.message || "Impossible de se connecter à la SFD",
        variant: "destructive"
      });
      return false;
    }
  }, [sfdId, toast]);

  return {
    synchronizeWithSfd,
    testConnection,
    isSyncing,
    lastSyncedAt,
    syncError
  };
}
