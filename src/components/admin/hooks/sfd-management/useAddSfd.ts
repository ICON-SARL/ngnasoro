
import { useState } from 'react';
import { useSfdMutations } from './useSfdMutations';
import { useToast } from '@/hooks/use-toast';
import { SfdFormValues } from '@/components/admin/sfd/AddSfdDialog';

export function useAddSfd() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { addSfdMutation } = useSfdMutations();
  const { toast } = useToast();

  const openAddDialog = () => setIsAddDialogOpen(true);
  const closeAddDialog = () => setIsAddDialogOpen(false);

  const handleAddSfd = async (formData: SfdFormValues) => {
    return addSfdMutation.mutate(formData, {
      onSuccess: () => {
        toast({
          title: "SFD créée",
          description: "La SFD a été ajoutée avec succès",
        });
        closeAddDialog();
      },
      onError: (error) => {
        toast({
          title: "Erreur",
          description: `Une erreur est survenue: ${error.message}`,
          variant: "destructive",
        });
      }
    });
  };

  return {
    isAddDialogOpen,
    openAddDialog,
    closeAddDialog,
    handleAddSfd,
    isAdding: addSfdMutation.isPending
  };
}
