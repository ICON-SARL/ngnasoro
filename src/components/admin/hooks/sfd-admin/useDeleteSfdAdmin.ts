
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { deleteSfdAdmin } from './sfdAdminApiService';

export function useDeleteSfdAdmin() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: async (adminId: string) => {
      try {
        setError(null);
        console.log('Deleting SFD admin with ID:', adminId);
        await deleteSfdAdmin(adminId);
      } catch (err: any) {
        console.error('Error deleting SFD admin:', err);
        setError(err.message || "Une erreur s'est produite lors de la suppression de l'administrateur");
        throw err;
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "L'administrateur a été supprimé avec succès",
      });
      
      // Invalider les requêtes pour forcer une actualisation des données
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur s'est produite lors de la suppression",
        variant: "destructive",
      });
    }
  });

  return {
    deleteSfdAdmin: mutate,
    isDeleting,
    error
  };
}
