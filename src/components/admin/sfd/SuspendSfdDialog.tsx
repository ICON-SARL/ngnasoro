
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
  DialogClose 
} from '@/components/ui/dialog';
import { Sfd } from '../types/sfd-types';

interface SuspendSfdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSfd: Sfd | null;
  onConfirm: (sfdId: string) => void;
  isPending: boolean;
}

export function SuspendSfdDialog({ 
  open, 
  onOpenChange, 
  selectedSfd, 
  onConfirm, 
  isPending 
}: SuspendSfdDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspendre le compte SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir suspendre le compte SFD "{selectedSfd?.name}"? Cette action empêchera l'accès à la plateforme.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button 
            variant="destructive" 
            onClick={() => selectedSfd && onConfirm(selectedSfd.id)}
            disabled={isPending}
          >
            {isPending ? 'En cours...' : 'Suspendre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
