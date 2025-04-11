
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useAccountSynchronization() {
  const [isSynchronizing, setIsSynchronizing] = useState(false);
  const { toast } = useToast();

  /**
   * Synchronise un compte client SFD avec un compte utilisateur
   * @param clientId Identifiant du client SFD
   * @param userEmail Email de l'utilisateur à associer (optionnel)
   */
  const linkClientToUser = async (clientId: string, userEmail?: string): Promise<boolean> => {
    setIsSynchronizing(true);
    try {
      // 1. Si aucun email n'est fourni, vérifier si le client a déjà un email
      if (!userEmail) {
        const { data: clientData, error: clientError } = await supabase
          .from('sfd_clients')
          .select('email, sfd_id')
          .eq('id', clientId)
          .single();
          
        if (clientError || !clientData.email) {
          throw new Error("Email du client introuvable. Veuillez spécifier un email.");
        }
        
        userEmail = clientData.email;
      }
      
      // 2. Vérifier si l'utilisateur existe déjà
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', userEmail)
        .single();
        
      let userId: string | null = userData?.id || null;
      
      // 3. Si l'utilisateur n'existe pas, créer un nouveau compte
      if (!userId) {
        // Générer un mot de passe temporaire
        const tempPassword = Math.random().toString(36).slice(-10) + Math.random().toString(10).slice(-2);
        
        // Créer un nouvel utilisateur
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: userEmail,
          password: tempPassword,
          options: {
            data: {
              full_name: (await supabase.from('sfd_clients').select('full_name').eq('id', clientId).single()).data?.full_name
            }
          }
        });
        
        if (signUpError) throw signUpError;
        userId = newUser.user?.id || null;
        
        // Envoyer un email avec les informations de connexion
        await supabase.functions.invoke('send-client-credentials', {
          body: {
            email: userEmail,
            password: tempPassword,
            clientId: clientId
          }
        });
      }
      
      if (!userId) throw new Error("Impossible de créer ou trouver l'utilisateur");
      
      // 4. Lier le client SFD à l'utilisateur
      const { data: clientData, error: clientDataError } = await supabase
        .from('sfd_clients')
        .select('sfd_id')
        .eq('id', clientId)
        .single();
        
      if (clientDataError) throw clientDataError;
      
      const { error: updateError } = await supabase
        .from('sfd_clients')
        .update({ user_id: userId })
        .eq('id', clientId);
        
      if (updateError) throw updateError;
      
      // 5. Synchroniser les comptes
      await synchronizeAccounts(clientId, clientData.sfd_id);
      
      toast({
        title: "Compte synchronisé",
        description: "Le compte client a été lié à un compte utilisateur avec succès",
      });
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la synchronisation des comptes:', error);
      toast({
        title: "Erreur",
        description: `Impossible de lier les comptes: ${error.message}`,
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSynchronizing(false);
    }
  };

  /**
   * Synchronise les balances et transactions entre comptes
   */
  const synchronizeAccounts = async (clientId: string, sfdId: string): Promise<boolean> => {
    try {
      // Appeler la fonction de synchronisation dans la base de données
      const { data, error } = await supabase
        .rpc('sync_client_accounts', { 
          p_sfd_id: sfdId,
          p_client_id: clientId 
        });
        
      if (error) throw error;
      
      // Propager les transactions client vers le compte utilisateur
      const { data: clientData, error: clientError } = await supabase
        .from('sfd_clients')
        .select('user_id')
        .eq('id', clientId)
        .single();
        
      if (clientError || !clientData.user_id) {
        console.error('Compte utilisateur non trouvé pour ce client');
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Erreur lors de la synchronisation des comptes:', error);
      return false;
    }
  };

  return {
    linkClientToUser,
    synchronizeAccounts,
    isSynchronizing
  };
}
