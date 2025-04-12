
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { ErrorAlert } from '@/components/admin/shared/ErrorAlert';
import { SfdAdminForm, AddAdminFormValues } from './components/SfdAdminForm';

interface AddSfdAdminDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: any) => void;
  isLoading: boolean;
  error: any;
}

export function AddSfdAdminDialog({
  open,
  onOpenChange,
  sfdId,
  sfdName,
  onAddAdmin,
  isLoading,
  error
}: AddSfdAdminDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);
  
  // Mise à jour de l'erreur à partir des props
  useEffect(() => {
    setFormError(error);
  }, [error]);
  
  // Réinitialiser l'erreur de formulaire lors de l'ouverture du dialogue
  useEffect(() => {
    if (open) {
      setFormError(null);
    }
  }, [open]);

  const handleSubmit = (values: AddAdminFormValues) => {
    setFormError(null);
    onAddAdmin({
      ...values,
      sfd_id: sfdId,
    });
  };

  const handleCancel = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  // Empêcher la fermeture du dialogue pendant le chargement
  const handleOpenChange = (newOpenState: boolean) => {
    // Si l'utilisateur ferme le dialogue et qu'un chargement est en cours, ne pas fermer
    if (isLoading && !newOpenState) return;
    onOpenChange(newOpenState);
  };

  const formDefaultValues = {
    full_name: '',
    email: '',
    password: '',
    role: 'sfd_admin',
    notify: true
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un compte d'administrateur pour {sfdName}
          </DialogDescription>
        </DialogHeader>
        
        <ErrorAlert error={formError} />
        
        <SfdAdminForm 
          defaultValues={formDefaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  );
}
