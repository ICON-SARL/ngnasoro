
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

interface SfdReactivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfd: Sfd | null;
  onConfirm: () => void;
  isLoading: boolean;
}

export function SfdReactivateDialog({ 
  open, 
  onOpenChange, 
  sfd, 
  onConfirm, 
  isLoading 
}: SfdReactivateDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réactiver le compte SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir réactiver le compte SFD "{sfd?.name}"?
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
            variant="default" 
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? 'En cours...' : 'Réactiver'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
