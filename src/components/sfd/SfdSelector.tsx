
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface SfdSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSfdSelected: () => void;
  disableReselection?: boolean;
}

export function SfdSelector({ 
  isOpen, 
  onClose, 
  onSfdSelected, 
  disableReselection 
}: SfdSelectorProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Sélectionner un SFD</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-center text-sm text-muted-foreground">
            Cette fonctionnalité sera disponible prochainement.
            <br />
            Pour l'instant, nous utilisons un SFD de démonstration.
          </p>
          <div className="mt-4 flex justify-center">
            <button 
              className="px-4 py-2 bg-green-600 text-white rounded-md"
              onClick={() => {
                onSfdSelected();
                onClose();
              }}
            >
              Utiliser SFD de démonstration
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
