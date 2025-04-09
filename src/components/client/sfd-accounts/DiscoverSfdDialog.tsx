
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface DiscoverSfdDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DiscoverSfdDialog = ({ open, onOpenChange }: DiscoverSfdDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Découvrir les SFDs</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-muted-foreground">
            Fonctionnalité en développement. Vous pourrez bientôt découvrir et demander l'accès à de nouvelles SFDs.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DiscoverSfdDialog;
