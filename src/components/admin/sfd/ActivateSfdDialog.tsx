
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sfd } from '../types/sfd-types';

interface ActivateSfdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sfd: Sfd | null;
  onActivate: () => void;
  isLoading: boolean;
}

export function ActivateSfdDialog({
  open,
  onOpenChange,
  sfd,
  onActivate,
  isLoading,
}: ActivateSfdDialogProps) {
  if (!sfd) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Activer la SFD</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir activer {sfd.name}? Cette action permettra à la SFD d'être complètement fonctionnelle.
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
            onClick={onActivate}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isLoading ? "Activation..." : "Confirmer l'activation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
