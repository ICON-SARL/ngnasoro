
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { AddSfdForm } from './AddSfdForm';
import { useCreateSfdMutation } from '../hooks/sfd-management/mutations';

interface SfdAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SfdAddDialog({ open, onOpenChange }: SfdAddDialogProps) {
  const createSfdMutation = useCreateSfdMutation();

  const handleSuccess = () => {
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ajouter une nouvelle SFD</DialogTitle>
          <DialogDescription>
            Créez une nouvelle institution de microfinance et associez-lui optionnellement un administrateur
          </DialogDescription>
        </DialogHeader>
        
        <AddSfdForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
          onSubmit={(formData, createAdmin, adminData) => {
            createSfdMutation.mutate({ 
              sfdData: formData, 
              createAdmin, 
              adminData 
            });
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
