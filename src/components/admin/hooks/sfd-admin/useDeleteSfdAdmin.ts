
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { deleteSfdAdmin } from './sfdAdminApiService';

export function useDeleteSfdAdmin() {
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: deleteSfdAdminMutation, isPending: isDeleting } = useMutation({
    mutationFn: async (adminId: string) => {
      try {
        setError(null);
        return await deleteSfdAdmin(adminId);
      } catch (err: any) {
        console.error('Error deleting SFD admin:', err);
        setError(err.message);
        throw err;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été supprimé avec succès.",
        variant: "default",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'administrateur SFD: ${err.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    deleteSfdAdmin: deleteSfdAdminMutation,
    isDeleting,
    error
  };
}
