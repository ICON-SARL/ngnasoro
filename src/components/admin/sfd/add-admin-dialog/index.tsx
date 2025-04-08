
import React from 'react';
import { AddSfdAdminForm } from './AddSfdAdminForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

interface AddSfdAdminDialogProps {
  sfdId: string;
  sfdName: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAddAdmin: (data: {
    email: string;
    password: string;
    full_name: string;
    role: string;
    sfd_id: string;
    notify: boolean;
  }) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function AddSfdAdminDialog({
  sfdId,
  sfdName,
  isOpen,
  onOpenChange,
  onAddAdmin,
  isLoading,
  error
}: AddSfdAdminDialogProps) {
  console.log("AddSfdAdminDialog rendering with props:", { sfdId, sfdName, isOpen, isLoading, error });
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter un nouvel administrateur SFD</DialogTitle>
          <DialogDescription>
            Créez un compte administrateur pour {sfdName}
          </DialogDescription>
        </DialogHeader>
        <AddSfdAdminForm
          sfdId={sfdId}
          onSubmit={onAddAdmin}
          isLoading={isLoading}
          serverError={error}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
