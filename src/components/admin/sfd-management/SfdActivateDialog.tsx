
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, AlertTriangle } from 'lucide-react';
import { UseMutationResult } from '@tanstack/react-query';
import { Sfd } from '../types/sfd-types';

interface SfdActivateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSfd: Sfd | null;
  activateSfdMutation: UseMutationResult<any, Error, string, unknown>;
}

export function SfdActivateDialog({
  open,
  onOpenChange,
  selectedSfd,
  activateSfdMutation,
}: SfdActivateDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmDisabled = confirmText !== 'ACTIVER';

  const handleActivate = async () => {
    if (!selectedSfd || isConfirmDisabled) return;
    
    try {
      await activateSfdMutation.mutateAsync(selectedSfd.id);
      onOpenChange(false);
      setConfirmText('');
    } catch (error) {
      console.error('Error activating SFD:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-green-500" />
            Activer la SFD
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point d'activer la SFD <strong>{selectedSfd?.name}</strong>. Cette action permettra aux utilisateurs de se connecter et d'utiliser les services de cette SFD.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            <p>
              L'activation d'une SFD rend ses services accessibles aux clients et autorise les opérations financières.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-activate" className="text-sm font-medium">
              Pour confirmer, tapez "ACTIVER" ci-dessous:
            </label>
            <input
              id="confirm-activate"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="ACTIVER"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              setConfirmText('');
            }}
          >
            Annuler
          </Button>
          <Button
            onClick={handleActivate}
            disabled={isConfirmDisabled || activateSfdMutation.isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {activateSfdMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Activation...
              </>
            ) : (
              'Activer la SFD'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
