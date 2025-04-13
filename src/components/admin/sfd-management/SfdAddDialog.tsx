
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { AddSfdForm } from '@/components/admin/sfd/AddSfdForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SfdAddDialog: React.FC<SfdAddDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleSubmit = async (formData: any, createAdmin: boolean, adminData: any) => {
    try {
      // Create SFD with or without admin based on user selection
      const functionName = createAdmin 
        ? 'create_sfd_with_admin_and_accounts'
        : 'create_sfd_with_admin';

      const { data, error } = await supabase
        .rpc(functionName, { 
          sfd_data: formData,
          admin_data: createAdmin ? adminData : null
        });

      if (error) throw error;

      toast({
        title: 'SFD créée avec succès',
        description: createAdmin 
          ? `La SFD ${formData.name} a été créée avec un administrateur`
          : `La SFD ${formData.name} a été créée`,
      });

      // Close the dialog
      onOpenChange(false);
      
      // Refresh the SFDs list and stats
      queryClient.invalidateQueries({ queryKey: ['sfds'] });
      queryClient.invalidateQueries({ queryKey: ['sfd-management-stats'] });
    } catch (error: any) {
      console.error('Error creating SFD:', error);
      toast({
        title: 'Erreur',
        description: `Impossible de créer la SFD: ${error.message}`,
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Remplissez les informations nécessaires pour créer une nouvelle SFD
          </DialogDescription>
        </DialogHeader>
        <AddSfdForm
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
