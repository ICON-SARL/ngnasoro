
import React from 'react';
import { SfdClient } from '@/types/sfdClients';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ClientProfileEdit } from '../ClientProfileEdit';

interface EditUserDialogProps {
  user: SfdClient;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditUserDialog({ user, open, onOpenChange }: EditUserDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier le client</DialogTitle>
          <DialogDescription>
            Modifiez les informations du client
          </DialogDescription>
        </DialogHeader>
        <ClientProfileEdit 
          client={user} 
          onSuccess={() => onOpenChange(false)} 
        />
      </DialogContent>
    </Dialog>
  );
}
