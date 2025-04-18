
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateTempPassword } from '@/utils/passwordUtils';
import { useQueryClient } from '@tanstack/react-query';

export function useClientManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createClientWithAccount = async (clientData: {
    full_name: string;
    email: string;
    phone?: string;
    address?: string;
    id_type?: string;
    id_number?: string;
  }) => {
    setIsLoading(true);
    try {
      // 1. Créer le client SFD
      const { data: clientResult, error: clientError } = await supabase
        .from('sfd_clients')
        .insert([{
          ...clientData,
          status: 'validated' // Le client est automatiquement validé
        }])
        .select()
        .single();

      if (clientError) throw clientError;

      // 2. Générer un mot de passe temporaire
      const tempPassword = generateTempPassword();

      // 3. Créer le compte utilisateur via la fonction créée
      const { data: userData, error: userError } = await supabase
        .rpc('create_user_from_client', {
          client_id: clientResult.id,
          temp_password: tempPassword
        });

      if (userError) throw userError;

      // 4. Notifier l'administrateur
      toast({
        title: 'Client créé avec succès',
        description: `Mot de passe temporaire : ${tempPassword}. Assurez-vous de le communiquer au client de manière sécurisée.`,
      });

      // 5. Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });

      return { clientId: clientResult.id, tempPassword };
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: error.message,
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createClientWithAccount,
    isLoading
  };
}
