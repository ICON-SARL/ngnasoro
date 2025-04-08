
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { AdminForm } from './AdminForm';
import { AdminFormValues } from './schema';

interface AddSfdAdminDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  sfdId: string;
  sfdName: string;
  onAddAdmin: (data: any) => void;
  isLoading: boolean;
  error: string | null;
}

export function AddSfdAdminDialog({
  isOpen,
  onOpenChange,
  sfdId,
  sfdName,
  onAddAdmin,
  isLoading,
  error
}: AddSfdAdminDialogProps) {
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = (values: AdminFormValues) => {
    setFormError(null);
    
    console.log("Submitting form with sfdId:", sfdId);
    
    if (!sfdId) {
      setFormError("Erreur: Aucune SFD sélectionnée");
      return;
    }
    
    const adminData = {
      ...values,
      sfd_id: sfdId
    };
    
    console.log("Submitting admin data:", { ...adminData, password: '***' });
    onAddAdmin(adminData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un administrateur SFD</DialogTitle>
          <DialogDescription>
            Créer un nouvel administrateur pour la SFD "{sfdName}".
          </DialogDescription>
        </DialogHeader>

        <AdminForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          formError={formError}
          error={error}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
