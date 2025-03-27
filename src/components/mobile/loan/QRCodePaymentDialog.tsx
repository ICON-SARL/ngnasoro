
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';

export interface QRCodePaymentDialogProps {
  isOpen?: boolean;
  onClose: () => void;
  amount: number;
  isWithdrawal: boolean;
  onSuccess?: () => Promise<void>;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ 
  isOpen = true, 
  onClose, 
  amount, 
  isWithdrawal,
  onSuccess
}) => {
  const [status, setStatus] = useState<'pending' | 'success'>('pending');
  const [isVerifying, setIsVerifying] = useState(false);

  // Simulate QR code scanning
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isOpen && status === 'pending') {
        setStatus('success');
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isOpen, status]);

  const handleComplete = async () => {
    setIsVerifying(true);
    
    // Simulate processing
    setTimeout(async () => {
      setIsVerifying(false);
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    }, 1500);
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => !isVerifying && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Paiement par QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {status === 'pending' ? (
            <>
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Génération du QR Code...</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mb-2">
                Scannez ce code avec votre application mobile money pour {isWithdrawal ? 'retirer' : 'déposer'} <strong>{amount.toLocaleString('fr-FR')} FCFA</strong>
              </p>
              <p className="text-xs text-gray-500 text-center">
                Le paiement par QR code est rapide et sécurisé
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">QR Code scanné avec succès!</h3>
              </div>
              <p className="text-center text-sm text-gray-600 mb-6">
                Votre transaction de <strong>{amount.toLocaleString('fr-FR')} FCFA</strong> a été autorisée.
              </p>
              <Button 
                onClick={handleComplete} 
                className="w-full" 
                disabled={isVerifying}
              >
                {isVerifying && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Terminer
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRCodePaymentDialog;
