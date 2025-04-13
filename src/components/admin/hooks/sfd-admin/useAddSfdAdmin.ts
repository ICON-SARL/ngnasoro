
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSfdAdmin } from './sfdAdminApiService';
import { useToast } from '@/hooks/use-toast';

export function useAddSfdAdmin() {
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addSfdAdminMutation = useMutation({
    mutationFn: async (adminData: {
      email: string;
      password: string;
      full_name: string;
      role: string;
      sfd_id: string;
      notify: boolean;
    }) => {
      setIsAdding(true);
      setError(null);
      try {
        const result = await addSfdAdmin(adminData);
        return result;
      } catch (err: any) {
        setError(err.message || 'Une erreur est survenue lors de la création de l\'administrateur');
        throw err;
      } finally {
        setIsAdding(false);
      }
    },
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "L'administrateur SFD a été créé avec succès",
      });
      // Invalidate the SFD admins query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['sfd-admins'] });
    },
    onError: (err: any) => {
      toast({
        title: "Erreur",
        description: err.message || "Une erreur est survenue lors de la création de l'administrateur",
        variant: "destructive",
      });
    }
  });

  return {
    addSfdAdmin: addSfdAdminMutation.mutate,
    isAdding,
    error
  };
}
