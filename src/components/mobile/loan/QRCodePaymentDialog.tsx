
import React from 'react';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  amount?: number;
  isWithdrawal?: boolean;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ onClose, amount, isWithdrawal }) => {
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Paiement par QR Code</DialogTitle>
        <DialogDescription>
          Scannez ce QR code en agence pour {isWithdrawal ? 'effectuer votre retrait' : 'effectuer votre paiement'}.
          {amount && <span className="font-semibold block mt-1">{amount.toLocaleString()} FCFA</span>}
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center justify-center py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="w-48 h-48 flex items-center justify-center border-2 border-dashed">
            <QrCode className="h-32 w-32 text-gray-300" />
          </div>
        </div>
      </div>
      <DialogFooter className="sm:justify-center">
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
