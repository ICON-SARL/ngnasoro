
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { edgeFunctionApi } from '@/utils/api/modules/edgeFunctionApi';

export function useRealtimeSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();

  const synchronizeWithSfd = useCallback(async () => {
    if (!user) {
      console.log("Cannot synchronize: No authenticated user");
      return false;
    }
    
    setIsSyncing(true);
    
    try {
      console.log(`Synchronizing accounts for user ${user.id}${activeSfdId ? ` with active SFD ${activeSfdId}` : ''}`);
      
      // Use the edgeFunctionApi to handle the call more gracefully
      const result = await edgeFunctionApi.callEdgeFunction('synchronize-sfd-accounts', {
        userId: user.id,
        sfdId: activeSfdId,
        forceSync: true
      }, { showToast: false });
      
      if (result && result.success) {
        setLastSynced(new Date());
        
        if (result.updates && result.updates.length > 0) {
          // Show success toast only if there were actual updates
          toast({
            title: "Synchronisation réussie",
            description: "Vos comptes SFD ont été mis à jour",
          });
        }
        
        return true;
      } else {
        // If the function returned a failure but didn't throw
        throw new Error(result?.message || "Échec de la synchronisation");
      }
    } catch (error: any) {
      console.error("Error synchronizing with SFD:", error);
      
      // Show a more user-friendly error message
      toast({
        title: "Erreur de synchronisation",
        description: "Impossible de synchroniser vos comptes pour le moment. Veuillez réessayer plus tard.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, activeSfdId, toast]);

  return {
    synchronizeWithSfd,
    isSyncing,
    lastSynced
  };
}
