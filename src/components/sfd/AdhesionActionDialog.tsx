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
import { Textarea } from '@/components/ui/textarea';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { ClientAdhesionRequest } from '@/types/adhesionTypes';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface AdhesionActionDialogProps {
  request: ClientAdhesionRequest | null;
  isOpen: boolean;
  action: 'approve' | 'reject' | null;
  onClose: () => void;
  onConfirm: (notes?: string) => void;
  notes: string;
  onNotesChange: (value: string) => void;
  isProcessing?: boolean;
  errorMessage?: string | null;
}

export function AdhesionActionDialog({
  request,
  isOpen,
  action,
  onClose,
  onConfirm,
  notes,
  onNotesChange,
  isProcessing = false,
  errorMessage = null,
}: AdhesionActionDialogProps) {
  if (!request || !action) return null;

  const handleConfirm = () => {
    onConfirm(notes);
  };

  return (
    <Dialog open={isOpen} onOpenChange={isProcessing ? undefined : onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {action === 'approve' ? 'Approuver' : 'Rejeter'} la demande d'adhésion
          </DialogTitle>
          <DialogDescription>
            {action === 'approve'
              ? 'Êtes-vous sûr de vouloir approuver cette demande ? Un compte client sera créé automatiquement.'
              : 'Êtes-vous sûr de vouloir rejeter cette demande ?'}
          </DialogDescription>
        </DialogHeader>

        <div className="py-3">
          <div className="space-y-4">
            <div>
              <p className="font-medium">Client</p>
              <p className="text-sm text-gray-500">{request.full_name}</p>
            </div>

            {errorMessage && (
              <Alert variant="destructive" className="my-2">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Une erreur s'est produite</AlertTitle>
                <AlertDescription>
                  <div className="space-y-2">
                    <p>{errorMessage}</p>
                    <p className="text-xs">Veuillez contacter l'administrateur si l'erreur persiste.</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div>
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (optionnel)
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Ajouter des notes ou commentaires..."
                className="mt-1"
                disabled={isProcessing}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button 
            variant="outline" 
            onClick={onClose}
            disabled={isProcessing}
          >
            Annuler
          </Button>
          <Button
            onClick={handleConfirm}
            className={action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Traitement en cours...
              </>
            ) : action === 'approve' ? (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Approuver
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Rejeter
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
