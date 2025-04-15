
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog, DialogContent, DialogHeader, 
  DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  Users, CheckCircle, XCircle, 
  AlertTriangle, FileUp, Download 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BatchOperationsProps {
  selectedCount: number;
  onValidate: (options: { notes?: string }) => void;
  onReject: (options: { rejectionReason?: string }) => void;
  isValidating: boolean;
  isRejecting: boolean;
}

export function BatchOperations({ 
  selectedCount, 
  onValidate, 
  onReject,
  isValidating,
  isRejecting
}: BatchOperationsProps) {
  const [showValidateDialog, setShowValidateDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [notes, setNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const handleValidate = () => {
    onValidate({ notes });
    setShowValidateDialog(false);
    setNotes('');
  };

  const handleReject = () => {
    onReject({ rejectionReason });
    setShowRejectDialog(false);
    setRejectionReason('');
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-muted/30 border rounded-lg p-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-primary" />
          <span className="font-medium">Actions en masse</span>
          <Badge variant="outline">{selectedCount} client{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}</Badge>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center text-green-600"
            onClick={() => setShowValidateDialog(true)}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Valider
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            className="flex items-center text-red-600"
            onClick={() => setShowRejectDialog(true)}
          >
            <XCircle className="h-4 w-4 mr-1" />
            Rejeter
          </Button>
        </div>
      </div>

      {/* Dialog de validation en masse */}
      <Dialog open={showValidateDialog} onOpenChange={setShowValidateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Validation en masse</DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de valider {selectedCount} client{selectedCount > 1 ? 's' : ''}.
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="notes" className="text-sm font-medium">
                Notes (optionnel)
              </label>
              <Textarea
                id="notes"
                placeholder="Ajouter des notes supplémentaires..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowValidateDialog(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="default"
              className="bg-green-600 hover:bg-green-700"
              onClick={handleValidate}
              disabled={isValidating}
            >
              {isValidating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Validation...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmer la validation
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de rejet en masse */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Rejet en masse
            </DialogTitle>
            <DialogDescription>
              Vous êtes sur le point de rejeter {selectedCount} client{selectedCount > 1 ? 's' : ''}.
              Cette action ne peut pas être annulée.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="rejectionReason" className="text-sm font-medium">
                Motif de rejet
              </label>
              <Textarea
                id="rejectionReason"
                placeholder="Indiquez le motif du rejet..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowRejectDialog(false)}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive"
              onClick={handleReject}
              disabled={isRejecting || !rejectionReason.trim()}
            >
              {isRejecting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Rejet en cours...
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Confirmer le rejet
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
