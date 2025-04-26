
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generateTempPassword } from '@/utils/passwordUtils';
import { generateClientCode } from '@/utils/clientCodeUtils';
import { useQueryClient } from '@tanstack/react-query';
import { useSfdDataAccess } from '@/hooks/useSfdDataAccess';

type ClientData = {
  full_name: string;
  email: string;
  phone?: string;
  address?: string;
  id_type?: string;
  id_number?: string;
};

export function useClientManagement() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { activeSfdId } = useSfdDataAccess();

  const createClientWithAccount = async (clientData: ClientData) => {
    setIsLoading(true);
    try {
      // Vérifier que l'ID SFD est disponible
      if (!activeSfdId) {
        throw new Error("Aucune SFD active sélectionnée");
      }

      // Get SFD code for the client code generation
      const { data: sfdData, error: sfdError } = await supabase
        .from('sfds')
        .select('code')
        .eq('id', activeSfdId)
        .single();
      
      if (sfdError) throw sfdError;
      
      // Generate a unique client code using the SFD code as prefix
      const clientCode = generateClientCode(sfdData?.code || 'SFD');

      // 1. Créer le client SFD
      const { data: clientResult, error: clientError } = await supabase
        .from('sfd_clients')
        .insert([{
          ...clientData,
          sfd_id: activeSfdId,
          status: 'validated', // Le client est automatiquement validé
          client_code: clientCode // Add the client code
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
        description: `Code client: ${clientCode}. Mot de passe temporaire : ${tempPassword}. Assurez-vous de les communiquer au client de manière sécurisée.`,
      });

      // 5. Rafraîchir les données
      queryClient.invalidateQueries({ queryKey: ['sfd-clients'] });

      return { 
        clientId: clientResult.id, 
        tempPassword,
        clientCode
      };
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
