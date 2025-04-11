
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
        if (!adminId) {
          throw new Error("ID d'administrateur requis");
        }
        
        setError(null);
        await deleteSfdAdmin(adminId);
        return adminId;
      } catch (err: any) {
        console.error('Error deleting SFD admin:', err);
        setError(err.message || "Une erreur s'est produite lors de la suppression de l'administrateur");
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été supprimé avec succès",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: `Erreur lors de la suppression de l'administrateur: ${error.message}`,
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
