
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/utils/formatters';
import { useQRCodeGeneration } from '@/hooks/mobile-money';
import { Loader } from '@/components/ui/loader';

export interface QRCodePaymentDialogProps {
  onClose: () => void;
  onComplete?: () => void;
  amount?: number;
  isWithdrawal: boolean;
  loanId?: string;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ 
  onClose, 
  onComplete,
  amount = 5000, 
  isWithdrawal,
  loanId
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const { generateQRCode, qrCodeData, isGenerating, error } = useQRCodeGeneration();
  
  useEffect(() => {
    const generateCode = async () => {
      setIsProcessing(true);
      try {
        const type = isWithdrawal ? 'withdrawal' : loanId ? 'loan_payment' : 'deposit';
        await generateQRCode(amount, type, loanId);
      } catch (err) {
        console.error('Error generating QR code:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    
    generateCode();
  }, [amount, isWithdrawal, loanId, generateQRCode]);
  
  // Generate QR code URL using the qrCodeData from the hook or fallback
  const qrCodeUrl = qrCodeData 
    ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`
    : `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
        JSON.stringify({
          amount,
          type: isWithdrawal ? 'withdrawal' : 'payment',
          reference: `${isWithdrawal ? 'WD' : 'PMT'}-${Date.now()}`,
          timestamp: new Date().toISOString()
        })
      )}`;
  
  const handleConfirm = () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsCompleted(true);
      
      // Notify parent component after a short delay
      setTimeout(() => {
        if (onComplete) onComplete();
        onClose();
      }, 1500);
    }, 3000);
  };
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center">
          {isWithdrawal ? 'Retirer des fonds' : 'Payer via Mobile Money'}
        </DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col items-center py-4">
        {isGenerating || isProcessing ? (
          <div className="py-10 flex flex-col items-center">
            <Loader size="lg" className="mb-4" />
            <p className="text-center text-gray-600">
              {isGenerating ? 'Génération du code QR...' : 'Traitement en cours...'}
            </p>
          </div>
        ) : !isCompleted ? (
          <>
            <div className="mb-4 bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-500 mb-1">Montant:</p>
              <p className="text-2xl font-bold text-[#0D6A51]">{formatCurrency(amount)}</p>
            </div>
            
            <div className="bg-white p-2 border rounded-md mb-4">
              <img 
                src={qrCodeUrl} 
                alt="QR Code de paiement" 
                className="w-56 h-56 object-contain"
              />
            </div>
            
            <p className="text-sm text-gray-500 text-center mb-4">
              {isWithdrawal 
                ? 'Scannez ce code avec votre application de mobile money pour retirer le montant' 
                : 'Scannez ce code avec votre application de mobile money pour effectuer le paiement'}
            </p>
          </>
        ) : (
          <div className="py-8 flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-10 w-10 text-green-600" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-medium mb-2">
              {isWithdrawal ? 'Retrait effectué' : 'Paiement réussi'}
            </h3>
            <p className="text-gray-500 text-center">
              {isWithdrawal 
                ? 'Le montant a été envoyé à votre compte mobile money.' 
                : 'Votre paiement a été traité avec succès.'}
            </p>
          </div>
        )}
      </div>
      
      <DialogFooter className="sm:justify-center">
        {!isCompleted ? (
          isProcessing || isGenerating ? (
            <Button disabled className="w-full">
              <span className="mr-2">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              Traitement en cours...
            </Button>
          ) : (
            <div className="flex gap-3 w-full">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Annuler
              </Button>
              <Button className="flex-1 bg-[#0D6A51] hover:bg-[#0D6A51]/90" onClick={handleConfirm}>
                Confirmer
              </Button>
            </div>
          )
        ) : (
          <Button className="bg-[#0D6A51] hover:bg-[#0D6A51]/90" onClick={onClose}>
            Fermer
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
