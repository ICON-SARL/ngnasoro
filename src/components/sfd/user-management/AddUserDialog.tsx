
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { NewClientForm } from '../NewClientForm';

interface AddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddUserDialog({ isOpen, onOpenChange }: AddUserDialogProps) {
  return (
    <>
      <Button onClick={() => onOpenChange(true)} className="bg-blue-600 hover:bg-blue-700">
        <UserPlus className="h-4 w-4 mr-2" />
        Ajouter un Client
      </Button>
      
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau client</DialogTitle>
            <DialogDescription>
              Complétez le formulaire pour créer un nouveau client SFD
            </DialogDescription>
          </DialogHeader>
          <NewClientForm onSuccess={() => onOpenChange(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}
