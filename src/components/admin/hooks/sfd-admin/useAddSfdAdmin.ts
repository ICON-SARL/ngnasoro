
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createSfdAdmin } from './sfdAdminApiService';
import { useAuth } from '@/hooks/auth';
import { supabase } from '@/integrations/supabase/client';

export function useAddSfdAdmin() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const { mutate: addSfdAdmin, isPending: isAdding } = useMutation({
    mutationFn: async (adminData: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      sfd_id: string;
      notify: boolean;
    }) => {
      try {
        if (!user) {
          throw new Error("Vous devez être connecté pour effectuer cette action");
        }
        
        setError(null);
        console.log("Création d'un admin SFD avec les données:", { 
          ...adminData, 
          password: "***" // Masquer le mot de passe dans les logs
        });
        
        // Vérifier d'abord si la SFD existe
        const { data: sfdCheck, error: sfdError } = await supabase
          .from('sfds')
          .select('id, name')
          .eq('id', adminData.sfd_id)
          .single();
          
        if (sfdError || !sfdCheck) {
          throw new Error(`La SFD avec l'ID ${adminData.sfd_id} n'existe pas ou n'est pas accessible`);
        }
        
        console.log("SFD vérifiée:", sfdCheck.name);
        
        // Vérifier si l'e-mail est déjà utilisé
        const { data: existingUser, error: checkError } = await supabase
          .from('admin_users')
          .select('id')
          .eq('email', adminData.email)
          .maybeSingle();
          
        if (existingUser) {
          throw new Error("Cet e-mail est déjà associé à un compte administrateur. Veuillez utiliser une autre adresse e-mail.");
        }
        
        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 est "aucune ligne retournée"
          console.warn("Erreur lors de la vérification de l'e-mail:", checkError);
        }
        
        // Utiliser le service API amélioré pour créer l'administrateur SFD
        const result = await createSfdAdmin(adminData);
        
        return result;
      } catch (err: any) {
        console.error('Erreur lors de l\'ajout de l\'administrateur SFD:', err);
        setError(err.message || "Une erreur s'est produite lors de la création de l'administrateur");
        throw err;
      }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      
      // Force un refetch immédiat
      queryClient.refetchQueries({ queryKey: ['sfd-admins'] });
      
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été créé avec succès.",
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de créer l'administrateur SFD: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    addSfdAdmin,
    isAdding,
    error
  };
}
