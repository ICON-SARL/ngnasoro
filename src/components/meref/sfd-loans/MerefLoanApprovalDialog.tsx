
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertTriangle } from 'lucide-react';
import { MerefSfdLoan } from '@/hooks/useMerefSfdLoans';

interface MerefLoanApprovalDialogProps {
  loan: MerefSfdLoan;
  open: boolean;
  onClose: () => void;
  onReject: (reason: string) => Promise<void>;
}

export function MerefLoanApprovalDialog({ 
  loan, 
  open, 
  onClose, 
  onReject 
}: MerefLoanApprovalDialogProps) {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) return;
    setIsLoading(true);
    try {
      await onReject(reason);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Rejeter le prêt
          </DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-muted/50 p-3 rounded-lg mb-4">
            <p className="text-sm">
              <strong>Référence:</strong> {loan.reference}
            </p>
            <p className="text-sm">
              <strong>SFD:</strong> {loan.sfds?.name}
            </p>
            <p className="text-sm">
              <strong>Montant:</strong> {loan.amount?.toLocaleString('fr-FR')} FCFA
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Motif du rejet *</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Expliquez la raison du rejet..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleReject}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? 'Traitement...' : 'Confirmer le rejet'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
