
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
} from '@/components/ui/dialog';
import { SfdFormValues } from './schemas/sfdFormSchema';
import { SfdForm } from './SfdForm';
import { Sfd } from '../types/sfd-types';

interface SfdEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfd: Sfd;
  onSubmit: (formData: SfdFormValues) => void;
  isLoading: boolean;
}

export function SfdEditDialog({ 
  open, 
  onOpenChange, 
  sfd,
  onSubmit, 
  isLoading 
}: SfdEditDialogProps) {
  // Convert the Sfd type to SfdFormValues
  const initialValues: SfdFormValues = {
    name: sfd.name,
    code: sfd.code,
    region: sfd.region || '',
    description: sfd.description || '',
    email: sfd.email || '',
    contact_email: sfd.contact_email || '',
    phone: sfd.phone || '',
    address: sfd.address || '',
    // The file fields will be handled by the form component
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Modifier la SFD: {sfd.name}</DialogTitle>
        </DialogHeader>
        
        <SfdForm 
          initialValues={initialValues}
          onSubmit={onSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
          isEditing
          sfdId={sfd.id}
        />
        
        <DialogFooter className="mt-4">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
