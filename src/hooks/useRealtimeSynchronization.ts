
import { useState, useCallback, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { adminCommunicationApi } from '@/utils/api/modules/adminCommunicationApi';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

export function useRealtimeSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  const syncInProgressRef = useRef(false);
  
  // Reset retry count when SFD changes
  useEffect(() => {
    setRetryCount(0);
    setSyncError(null);
  }, [activeSfdId]);

  const synchronizeWithSfd = useCallback(async () => {
    if (!user) {
      console.log("Cannot synchronize: No authenticated user");
      setSyncError("Vous devez être connecté pour synchroniser vos comptes");
      return false;
    }
    
    // Prevent concurrent synchronization calls
    if (syncInProgressRef.current) {
      console.log("Synchronization already in progress, skipping");
      return false;
    }
    
    syncInProgressRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    
    try {
      console.log(`Synchronizing accounts for user ${user.id}${activeSfdId ? ` with active SFD ${activeSfdId}` : ''}`);
      
      // Direct call to the supabase functions API for more control
      const { data: functionResponse, error: functionError } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: JSON.stringify({
          userId: user.id,
          sfdId: activeSfdId,
          forceSync: true
        })
      });
      
      if (functionError) {
        console.error("Error calling synchronize-sfd-accounts function:", functionError);
        throw new Error(`Erreur de communication avec le serveur: ${functionError.message}`);
      }
      
      if (!functionResponse.success) {
        throw new Error(functionResponse.message || "Échec de la synchronisation");
      }
      
      setLastSynced(new Date());
      setRetryCount(0); // Reset retry count on success
      
      if (functionResponse.updates && functionResponse.updates.length > 0) {
        // Show success toast only if there were actual updates
        toast({
          title: "Synchronisation réussie",
          description: "Vos comptes SFD ont été mis à jour",
        });
      }
      
      syncInProgressRef.current = false;
      return true;
    } catch (error: any) {
      console.error("Error synchronizing with SFD:", error);
      
      // Set the error message
      setSyncError(error.message || "Impossible de synchroniser vos comptes pour le moment");
      
      // Increment retry count for exponential backoff
      setRetryCount(prev => prev + 1);
      
      // Report error to admin backend
      if (activeSfdId) {
        adminCommunicationApi.reportSyncError(
          user.id, 
          activeSfdId, 
          error.message || "Unknown synchronization error", 
          error.stack
        ).catch(() => {
          // Silent failure for error reporting
        });
      }
      
      // Show a more user-friendly error message based on retry count
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

  // Test connection function
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
