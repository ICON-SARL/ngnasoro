
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Sfd } from '../types/sfd-types';

interface SfdSuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfd: Sfd | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function SfdSuspendDialog({ 
  open, 
  onOpenChange, 
  sfd, 
  onConfirm, 
  isLoading 
}: SfdSuspendDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Suspendre le compte SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir suspendre le compte SFD "{sfd?.name}"? Cette action empêchera l'accès à la plateforme.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'En cours...' : 'Suspendre'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
