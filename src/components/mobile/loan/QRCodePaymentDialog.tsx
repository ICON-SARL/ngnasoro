
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { useQRCodeGeneration } from '@/hooks/mobile-money/useQRCodeGeneration';
import QRCode from 'qrcode.react';

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
  const [status, setStatus] = useState<'generating' | 'ready' | 'success'>('generating');
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrData, setQrData] = useState<string | null>(null);
  const { generatePaymentQRCode, generateWithdrawalQRCode, isProcessingQRCode } = useQRCodeGeneration();

  useEffect(() => {
    if (isOpen && status === 'generating') {
      const generateCode = async () => {
        try {
          const response = isWithdrawal 
            ? await generateWithdrawalQRCode(amount)
            : await generatePaymentQRCode(amount);
            
          if (response.success && response.qrCode) {
            setQrData(JSON.stringify(response.qrCode));
            setStatus('ready');
          }
        } catch (error) {
          console.error('Error generating QR code:', error);
        }
      };
      
      generateCode();
    }
  }, [isOpen, status, amount, isWithdrawal, generatePaymentQRCode, generateWithdrawalQRCode]);

  // Simulate QR code scanning (for demo purposes)
  useEffect(() => {
    if (isOpen && status === 'ready') {
      const timer = setTimeout(() => {
        setStatus('success');
      }, 8000);

      return () => clearTimeout(timer);
    }
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
            {isWithdrawal ? 'Retrait' : 'Paiement'} par QR Code
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center py-4">
          {status === 'generating' || isProcessingQRCode ? (
            <>
              <div className="w-48 h-48 bg-gray-200 rounded-lg flex items-center justify-center mb-4">
                <div className="text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Génération du QR Code...</p>
                </div>
              </div>
              <p className="text-center text-sm text-gray-600 mb-2">
                Veuillez patienter...
              </p>
            </>
          ) : status === 'ready' && qrData ? (
            <>
              <div className="w-48 h-48 bg-white p-3 border rounded-lg flex items-center justify-center mb-4">
                <QRCode value={qrData} size={160} />
              </div>
              <p className="text-center text-sm text-gray-600 mb-2">
                Présentez ce code à l'agent SFD pour {isWithdrawal ? 'retirer' : 'payer'} <strong>{amount.toLocaleString('fr-FR')} FCFA</strong>
              </p>
              <p className="text-xs text-gray-500 text-center">
                Ce code expire dans 15 minutes
              </p>
            </>
          ) : (
            <>
              <div className="mb-4 text-center">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-2" />
                <h3 className="text-lg font-medium">Opération validée !</h3>
              </div>
              <p className="text-center text-sm text-gray-600 mb-6">
                Votre {isWithdrawal ? 'retrait' : 'paiement'} de <strong>{amount.toLocaleString('fr-FR')} FCFA</strong> a été traité avec succès.
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
