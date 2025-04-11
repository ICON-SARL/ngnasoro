import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sfdApi } from '@/utils/api/modules/sfdApi';
import { useToast } from '@/hooks/use-toast';
import { useCreateSfdMutation } from './mutations/useCreateSfdMutation';
import { useEditSfdMutation } from './mutations/useEditSfdMutation';
import { useSuspendSfdMutation } from './mutations/useSuspendSfdMutation';
import { useReactivateSfdMutation } from './mutations/useReactivateSfdMutation';
import { useActivateSfdMutation } from './mutations/useActivateSfdMutation';
import { useAddSfdMutation } from './mutations/useAddSfdMutation';

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
  
  const addSfdMutation = useAddSfdMutation();
  const editSfdMutation = useEditSfdMutation();
  const suspendSfdMutation = useSuspendSfdMutation(); 
  const reactivateSfdMutation = useReactivateSfdMutation();
  const activateSfdMutation = useActivateSfdMutation();
  
  return {
    createSfd,
    updateSfd,
    addSfdMutation,
    editSfdMutation,
    suspendSfdMutation,
    reactivateSfdMutation,
    activateSfdMutation
  };
}
