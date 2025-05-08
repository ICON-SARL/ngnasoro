
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { adminCommunicationApi } from '@/utils/api/modules/adminCommunicationApi';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const syncInProgressRef = useRef(false);
  
  useEffect(() => {
    setRetryCount(0);
    setSyncError(null);
  }, [activeSfdId]);

  const synchronizeWithSfd = useCallback(async (forceFullSync = false) => {
    if (!user) {
      console.log("Cannot synchronize: No authenticated user");
      setSyncError("Vous devez être connecté pour synchroniser vos comptes");
      return false;
    }
    
    if (syncInProgressRef.current) {
      console.log("Synchronization already in progress, skipping");
      return false;
    }
    
    syncInProgressRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      console.log(`Synchronizing accounts for user ${user.id}${activeSfdId ? ` with active SFD ${activeSfdId}` : ''}, forceFullSync: ${forceFullSync}`);
      
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: {
          userId: user.id,
          sfdId: activeSfdId || null,
          forceFullSync: forceFullSync
        }
      });
      
      if (error) {
        console.error("Error calling synchronize-sfd-accounts function:", error);
        throw new Error(`Erreur de communication avec le serveur: ${error.message}`);
      }
      
      console.log("Synchronization response:", data);
      
      // Check for success from the data object itself
      if (data && data.success === false) {
        throw new Error(data.message || "Échec de la synchronisation");
      }
      
      setLastSynced(new Date());
      setRetryCount(0);
      
      if (data && data.syncedAccounts && data.syncedAccounts.length > 0) {
        toast({
          title: "Synchronisation réussie",
          description: `Vos comptes SFD ont été mis à jour (${data.syncedAccounts.length} comptes)`,
        });
      }
      
      syncInProgressRef.current = false;
      return true;
    } catch (error: any) {
      console.error("Error synchronizing with SFD:", error);
      
      setSyncError(error.message || "Impossible de synchroniser vos comptes pour le moment");
      
      setRetryCount(prev => prev + 1);
      
      if (activeSfdId) {
        try {
          await adminCommunicationApi.reportSyncError(
            user.id, 
            activeSfdId, 
            error.message || "Unknown synchronization error", 
            error.stack
          );
        } catch (reportError) {
          console.error("Failed to report error:", reportError);
        }
      }
      
      if (retryCount > 2) {
        toast({
          title: "Problème de connexion persistant",
          description: "Nous rencontrons des difficultés pour synchroniser vos comptes. Veuillez réessayer plus tard.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur de synchronisation",
          description: "Impossible de synchroniser vos comptes pour le moment. Veuillez réessayer.",
          variant: "destructive",
        });
      }
      
      syncInProgressRef.current = false;
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, activeSfdId, toast, retryCount]);

  const testConnection = useCallback(async () => {
    if (!user || !activeSfdId) return false;
    
    try {
      const result = await adminCommunicationApi.pingAdminServer();
      return result && result.success;
    } catch (error) {
      console.error("Connection test failed:", error);
      return false;
    }
  }, [user, activeSfdId]);

  return {
    synchronizeWithSfd,
    testConnection,
    isSyncing,
    lastSynced,
    syncError,
    retryCount
  };
}
