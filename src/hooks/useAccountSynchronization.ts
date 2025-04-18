
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAccountSynchronization() {
  const { toast } = useToast();

  /**
   * Synchronize client accounts with user accounts
   * @param clientId Optional client ID to synchronize specific client
   * @returns 
   */
  const synchronizeAccounts = useCallback(async (clientId?: string): Promise<boolean> => {
    try {
      // Si un clientId est fourni, synchroniser seulement ce client
      if (clientId) {
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('id, sfd_id, user_id')
          .eq('id', clientId)
          .single();
        
        if (clientError || !clientData.user_id) {
          console.error('Client not found or no user_id:', clientError);
          return false;
        }

        // Vérifier si le compte existe déjà
        const { data: accountData, error: accountError } = await supabase
          .from('accounts')
          .select('*')
          .eq('user_id', clientData.user_id)
          .maybeSingle();

        // Si le compte n'existe pas, le créer
        if (!accountData) {
          const { error: insertError } = await supabase
            .from('accounts')
            .insert({
              user_id: clientData.user_id,
              sfd_id: clientData.sfd_id,
              balance: 0,
              currency: 'FCFA'
            });
          
          if (insertError) {
            console.error('Error creating account:', insertError);
            return false;
          }
        }
        
        return true;
      } else {
        // Synchroniser tous les comptes via la fonction RPC (backend)
        const { data: result, error } = await supabase
          .rpc('sync_client_accounts');
        
        if (error) {
          console.error('Error synchronizing accounts:', error);
          toast({
            title: "Erreur de synchronisation",
            description: "Impossible de synchroniser les comptes",
            variant: "destructive",
          });
          return false;
        }
        
        return true;
      }
    } catch (error: any) {
      console.error('Error in account synchronization:', error);
      toast({
        title: "Erreur",
        description: "Une erreur s'est produite lors de la synchronisation",
        variant: "destructive",
      });
      return false;
    }
  }, [toast]);

  return { synchronizeAccounts };
}
