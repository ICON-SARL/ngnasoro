
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { synchronizeAccounts } from './sfd/sfdAccountsApi';

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
      
      const syncResult = await synchronizeAccounts(user.id, activeSfdId || undefined);
      
      if (syncResult.success) {
        setLastSynced(new Date());
        
        if (syncResult.updates.length > 0) {
          // Show success toast only if there were actual updates
          toast({
            title: "Synchronisation réussie",
            description: "Vos comptes SFD ont été mis à jour",
          });
        }
        
        return true;
      } else {
        throw new Error(syncResult.message || "Échec de la synchronisation");
      }
    } catch (error: any) {
      console.error("Error synchronizing with SFD:", error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Impossible de synchroniser vos comptes",
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
