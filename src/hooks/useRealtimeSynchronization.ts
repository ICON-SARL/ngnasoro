
import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export function useRealtimeSynchronization() {
  const [isSyncing, setIsSyncing] = useState(false);
  const { user, activeSfdId } = useAuth();
  const { toast } = useToast();

  const synchronizeWithSfd = useCallback(async () => {
    if (!user?.id) {
      console.error('Cannot synchronize: No user is logged in');
      return false;
    }

    if (!activeSfdId) {
      console.error('Cannot synchronize: No active SFD selected');
      toast({
        title: 'Synchronisation impossible',
        description: 'Veuillez sélectionner une SFD active',
        variant: 'destructive',
      });
      return false;
    }

    try {
      setIsSyncing(true);
      
      // Call the edge function to synchronize SFD accounts
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: JSON.stringify({ 
          userId: user.id,
          sfdId: activeSfdId
        }),
      });
      
      if (error) {
        console.error('Synchronization error:', error);
        toast({
          title: 'Erreur de synchronisation',
          description: 'Impossible de mettre à jour les données avec le SFD',
          variant: 'destructive',
        });
        return false;
      }
      
      toast({
        title: 'Synchronisation réussie',
        description: 'Vos données financières ont été mises à jour',
      });
      
      return true;
    } catch (error) {
      console.error('Error synchronizing with SFD:', error);
      toast({
        title: 'Erreur de synchronisation',
        description: 'Une erreur est survenue lors de la synchronisation',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user, activeSfdId, toast]);

  return {
    isSyncing,
    synchronizeWithSfd
  };
}
