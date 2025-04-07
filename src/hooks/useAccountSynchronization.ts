import { useCallback, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export function useAccountSynchronization() {
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();

  /**
   * Synchronize client accounts with user application accounts
   * This can be called manually or automatically on schedule
   */
  const synchronizeAccounts = useCallback(async (clientId?: string) => {
    if (!activeSfdId) {
      console.error("No active SFD found");
      return false;
    }

    setIsLoading(true);
    
    try {
      // If clientId is provided, sync only that client account
      // Otherwise sync all client accounts in the SFD
      const { data, error } = await supabase.rpc('sync_client_accounts', { 
        p_sfd_id: activeSfdId,
        p_client_id: clientId || null
      });
      
      if (error) throw error;
      
      setLastSynced(new Date());
      
      toast({
        title: "Synchronisation réussie",
        description: clientId 
          ? "Le compte client a été synchronisé avec succès" 
          : "Tous les comptes clients ont été synchronisés avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error synchronizing accounts:", error);
      toast({
        title: "Erreur de synchronisation",
        description: error.message || "Une erreur s'est produite lors de la synchronisation",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [activeSfdId, toast]);

  /**
   * Propagate a specific transaction from a client account to a user application account
   */
  const propagateTransaction = useCallback(async (transactionId: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.rpc('propagate_client_transaction', { 
        p_transaction_id: transactionId
      });
      
      if (error) throw error;
      
      toast({
        title: "Transaction propagée",
        description: "La transaction a été enregistrée dans le compte utilisateur",
      });
      
      return true;
    } catch (error: any) {
      console.error("Error propagating transaction:", error);
      toast({
        title: "Erreur de propagation",
        description: error.message || "Une erreur s'est produite lors de la propagation de la transaction",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    synchronizeAccounts,
    propagateTransaction,
    isLoading,
    lastSynced
  };
}
