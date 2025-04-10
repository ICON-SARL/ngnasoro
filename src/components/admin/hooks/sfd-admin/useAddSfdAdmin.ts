
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { createSfdAdmin } from './sfdAdminApiService';
import { useAuth } from '@/hooks/auth';

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
        console.log("Creating SFD admin with data:", { 
          ...adminData, 
          password: "***" // Masquer le mot de passe dans les logs
        });
        
        return await createSfdAdmin(adminData);
      } catch (err: any) {
        console.error('Error adding SFD admin:', err);
        setError(err.message || "Une erreur s'est produite lors de la création de l'administrateur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
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
