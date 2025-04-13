
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { QRCode } from '@/components/ui/qr-code';
import { Progress } from '@/components/ui/progress';
import { useQRCodeGeneration } from '@/hooks/useQRCodeGeneration';
import { Loader2, ShieldCheck } from 'lucide-react';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  isWithdrawal?: boolean;
  amount?: number;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({
  onClose,
  isWithdrawal = false,
  amount = isWithdrawal ? 25000 : 3500
}) => {
  const [expirationSeconds, setExpirationSeconds] = useState(900); // 15 minutes
  const { isGenerating, qrCodeData, generateQRCode } = useQRCodeGeneration();
  
  // Generate QR code on mount
  useEffect(() => {
    const generateCode = async () => {
      await generateQRCode(amount, isWithdrawal ? 'withdrawal' : 'deposit');
    };
    
    generateCode();
    
    // Setup expiration countdown
    const countdownInterval = setInterval(() => {
      setExpirationSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(countdownInterval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(countdownInterval);
  }, []);
  
  // Format time remaining
  const formatTimeRemaining = () => {
    const minutes = Math.floor(expirationSeconds / 60);
    const seconds = expirationSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Calculate expiration progress
  const expirationProgress = (expirationSeconds / 900) * 100;
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center">
          {isWithdrawal ? "Scanner pour retirer" : "Scanner pour payer"}
        </DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center p-4">
        {isGenerating || !qrCodeData ? (
          <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-sm text-center text-gray-500">
              Génération du code QR en cours...
            </p>
          </div>
        ) : (
          <>
            <div className="p-4 border-2 border-primary/20 rounded-lg bg-gray-50 mb-4">
              <QRCode value={qrCodeData} size={200} />
            </div>
            
            <p className="text-sm text-center mb-4">
              Présentez ce code QR en agence SFD pour {isWithdrawal ? 'effectuer votre retrait' : 'finaliser votre paiement'}.
            </p>
            
            <div className="w-full space-y-2 mb-4">
              <div className="flex justify-between text-xs">
                <span>Expire dans:</span>
                <span className={expirationSeconds < 60 ? 'text-red-500 font-bold' : ''}>
                  {formatTimeRemaining()}
                </span>
              </div>
              <Progress value={expirationProgress} className="h-2" />
            </div>
            
            <div className="flex items-center text-xs text-green-700 mb-4">
              <ShieldCheck className="h-4 w-4 mr-1" />
              <span>Sécurisé avec chiffrement de bout en bout</span>
            </div>
          </>
        )}
      </div>
      
      <DialogFooter className="sm:justify-center">
        <Button 
          variant="outline" 
          onClick={onClose} 
          className="w-full"
        >
          Fermer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
