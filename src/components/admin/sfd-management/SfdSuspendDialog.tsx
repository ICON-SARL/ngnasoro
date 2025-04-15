
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

interface SfdSuspendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedSfd: Sfd | null;
  suspendSfdMutation: UseMutationResult<any, Error, string, unknown>;
}

export function SfdSuspendDialog({
  open,
  onOpenChange,
  selectedSfd,
  suspendSfdMutation,
}: SfdSuspendDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmDisabled = confirmText !== 'SUSPENDRE';

  const handleSuspend = async () => {
    if (!selectedSfd || isConfirmDisabled) return;
    
    try {
      await suspendSfdMutation.mutateAsync(selectedSfd.id);
      onOpenChange(false);
      setConfirmText('');
    } catch (error) {
      console.error('Error suspending SFD:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Suspendre la SFD
          </DialogTitle>
          <DialogDescription>
            Vous êtes sur le point de suspendre la SFD <strong>{selectedSfd?.name}</strong>. Cette action empêchera aux utilisateurs de se connecter et d'utiliser les services de cette SFD.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-2">
          <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
            <p>
              La suspension d'une SFD arrête immédiatement toutes les opérations et bloque l'accès pour tous les utilisateurs. Cette action est réversible.
            </p>
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm-suspend" className="text-sm font-medium">
              Pour confirmer, tapez "SUSPENDRE" ci-dessous:
            </label>
            <input
              id="confirm-suspend"
              type="text"
              className="w-full px-3 py-2 border rounded-md"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="SUSPENDRE"
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
            variant="destructive"
            onClick={handleSuspend}
            disabled={isConfirmDisabled || suspendSfdMutation.isPending}
          >
            {suspendSfdMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Suspension...
              </>
            ) : (
              'Suspendre la SFD'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
