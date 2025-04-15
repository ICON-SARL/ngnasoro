
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { SfdAdminForm } from './components/SfdAdminForm';
import { useSfdAdminForm } from './hooks/useSfdAdminForm';

interface SfdAdminAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SfdAdminAddDialog: React.FC<SfdAdminAddDialogProps> = ({ 
  open, 
  onOpenChange 
}) => {
  const {
    form,
    isLoading,
    submitError,
    handleSubmit
  } = useSfdAdminForm(() => onOpenChange(false));

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (isLoading && open && !newOpen) {
        const confirmed = window.confirm("La création de l'administrateur est en cours. Êtes-vous sûr de vouloir annuler ?");
        if (!confirmed) return;
      }
      
      if (!newOpen) {
        form.reset();
      }
      
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un nouveau compte administrateur pour une SFD existante
          </DialogDescription>
        </DialogHeader>
        
        <SfdAdminForm
          form={form}
          isLoading={isLoading}
          submitError={submitError}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
};
