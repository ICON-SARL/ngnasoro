
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { sfdApi } from '@/utils/api/modules/sfdApi';

export function useAddSfdMutation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sfdData: any) => {
      try {
        const result = await sfdApi.createSfdWithAdmin(sfdData);
        return result;
      } catch (error: any) {
        console.error('Error creating SFD:', error);
        throw new Error(error.message || 'Une erreur est survenue lors de la création de la SFD');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-management-stats'] });
      toast({
        title: 'SFD créée',
        description: 'La SFD a été créée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Une erreur est survenue lors de la création de la SFD',
        variant: 'destructive',
      });
    },
  });
}
