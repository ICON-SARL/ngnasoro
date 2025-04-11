
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sfdApi } from '@/utils/api/modules/sfdApi';
import { useToast } from '@/hooks/use-toast';

export function useSfdMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const createSfd = useMutation({
    mutationFn: async (sfdData: any) => {
      return sfdApi.createSfdWithAdmin(sfdData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD ajoutée',
        description: 'La SFD a été créée avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la création de la SFD: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  const updateSfd = useMutation({
    mutationFn: async ({ sfdId, data }: { sfdId: string; data: any }) => {
      // Implémentation de la mise à jour de la SFD
      // À compléter selon vos besoins
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      toast({
        title: 'SFD mise à jour',
        description: 'La SFD a été mise à jour avec succès',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erreur',
        description: `Erreur lors de la mise à jour de la SFD: ${error.message}`,
        variant: 'destructive',
      });
    },
  });
  
  return {
    createSfd,
    updateSfd,
  };
}
