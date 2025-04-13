
import React, { useEffect, useState } from 'react';
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, QrCode } from 'lucide-react';
import { useQRCodeGeneration } from '@/hooks/mobile-money';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  amount?: number;
  isWithdrawal?: boolean;
  loanId?: string;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ 
  onClose, 
  amount = 5000,
  isWithdrawal = false,
  loanId
}) => {
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [qrReady, setQrReady] = useState(false);
  
  const { 
    generateQRCode,
    qrCodeData,
    isGenerating,
    error,
    expiresAt
  } = useQRCodeGeneration();
  
  // Generate QR code when component mounts
  useEffect(() => {
    const generateCode = async () => {
      try {
        const type = isWithdrawal ? 'withdrawal' : loanId ? 'loan_payment' : 'deposit';
        await generateQRCode(amount, type, loanId);
      } catch (err) {
        console.error('Error generating QR code:', err);
      }
    };
    
    generateCode();
  }, [amount, isWithdrawal, loanId]);
  
  // Set expiry time when expiresAt changes
  useEffect(() => {
    if (expiresAt) {
      const expiry = new Date(expiresAt);
      setExpiryTime(expiry);
      
      // Calculate initial time left
      const now = new Date();
      const initialTimeLeft = Math.max(0, Math.floor((expiry.getTime() - now.getTime()) / 1000));
      setTimeLeft(initialTimeLeft);
    }
  }, [expiresAt]);
  
  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]);
  
  // Format time left as mm:ss
  const formatTimeLeft = () => {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // Animation for QR code appearance
  useEffect(() => {
    if (qrCodeData && !qrReady) {
      const timer = setTimeout(() => {
        setQrReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [qrCodeData, qrReady]);
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Code QR pour {isWithdrawal ? 'Retrait' : loanId ? 'Remboursement' : 'Dépôt'}
        </DialogTitle>
        <DialogDescription>
          Présentez ce code QR à l'agent SFD pour {isWithdrawal ? 'effectuer votre retrait' : loanId ? 'effectuer votre remboursement' : 'effectuer votre dépôt'}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center py-4">
        {isGenerating ? (
          <div className="flex flex-col items-center justify-center h-60">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="text-sm text-gray-500">Génération du code QR...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-60">
            <p className="text-red-500 mb-2">Erreur: {error}</p>
            <Button onClick={() => generateQRCode(amount, isWithdrawal ? 'withdrawal' : 'deposit')}>
              Réessayer
            </Button>
          </div>
        ) : qrCodeData ? (
          <div className={`transition-opacity duration-500 ${qrReady ? 'opacity-100' : 'opacity-0'}`}>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <img 
                src={`data:image/svg+xml;base64,${qrCodeData}`} 
                alt="QR Code"
                className="w-60 h-60" 
              />
            </div>
            
            <div className="text-center">
              <p className="text-lg font-semibold mb-1">
                {amount.toLocaleString()} FCFA
              </p>
              <p className="text-sm text-gray-600 mb-2">
                Ce code expire dans: <span className="font-medium">{formatTimeLeft()}</span>
              </p>
              {timeLeft === 0 && (
                <Button 
                  variant="outline" 
                  onClick={() => generateQRCode(amount, isWithdrawal ? 'withdrawal' : 'deposit')}
                >
                  Générer un nouveau code
                </Button>
              )}
            </div>
          </div>
        ) : null}
      </div>
      
      <DialogFooter>
        <Button onClick={onClose}>Fermer</Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
