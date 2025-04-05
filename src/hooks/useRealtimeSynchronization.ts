
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export function useRealtimeSynchronization() {
  const { user, activeSfdId } = useAuth();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const { toast } = useToast();

  // Function to trigger manual synchronization with SFD systems
  const synchronizeWithSfd = useCallback(async () => {
    if (!user?.id) {
      console.log("Erreur: utilisateur non connecté");
      return false;
    }

    setIsSyncing(true);
    
    try {
      // Call the edge function to synchronize accounts
      const { data, error } = await supabase.functions.invoke('synchronize-sfd-accounts', {
        body: JSON.stringify({ userId: user.id }),
      });
      
      if (error) {
        console.error("Erreur durant la synchronisation:", error);
        throw error;
      }
      
      if (data && data.success) {
        setLastSyncTime(new Date());
        toast({
          title: "Synchronisation réussie",
          description: "Vos comptes ont été synchronisés avec succès",
        });
        return true;
      } else {
        throw new Error(data?.message || "La synchronisation a échoué");
      }
    } catch (error: any) {
      console.error('Synchronization error:', error);
      // Ne pas afficher de toast d'erreur pour éviter de frustrer l'utilisateur
      // en environnement de développement où la fonction edge peut ne pas exister
      return false;
    } finally {
      setIsSyncing(false);
    }
  }, [user?.id, toast]);

  // Set up realtime listener for balance changes
  useEffect(() => {
    if (!user?.id) return;
    
    // Connect to realtime changes for accounts
    const channel = supabase.channel('account_changes')
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'accounts',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        // When account data changes, show a toast notification
        toast({
          title: "Compte mis à jour",
          description: "Vos données financières ont été actualisées",
        });
        
        // Update last sync time
        setLastSyncTime(new Date());
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, toast]);

  return {
    isSyncing,
    lastSyncTime,
    synchronizeWithSfd
  };
}
