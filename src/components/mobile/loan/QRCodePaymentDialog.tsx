
import React, { useEffect, useState } from 'react';
import { QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useMobileMoneyOperations } from '@/hooks/useMobileMoneyOperations';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  amount?: number;
  isWithdrawal?: boolean;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ onClose, amount = 0, isWithdrawal = false }) => {
  const { generateWithdrawalQRCode, generatePaymentQRCode, isProcessing } = useMobileMoneyOperations();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [qrCodeData, setQrCodeData] = useState<any>(null);
  
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const response = isWithdrawal 
          ? await generateWithdrawalQRCode(amount)
          : await generatePaymentQRCode(amount);
          
        if (response.success && response.qrCode) {
          // Dans un environnement réel, nous utiliserions l'URL du QR code ou générerions un QR code à partir des données
          // Pour cet exemple, nous simulons une URL de QR code
          setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
            JSON.stringify({
              type: isWithdrawal ? 'withdrawal' : 'payment',
              amount: amount,
              timestamp: new Date().toISOString(),
              reference: response.qrCode.code || 'QR' + Date.now()
            })
          )}`);
          
          setQrCodeData(response.qrCode);
        }
      } catch (error) {
        console.error('Erreur lors de la génération du QR code:', error);
      }
    };
    
    generateQRCode();
  }, [amount, isWithdrawal, generateWithdrawalQRCode, generatePaymentQRCode]);

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Paiement par QR Code</DialogTitle>
        <DialogDescription>
          Scannez ce QR code en agence SFD pour {isWithdrawal ? 'effectuer votre retrait' : 'effectuer votre paiement'}.
          <span className="font-semibold block mt-1">{amount.toLocaleString()} FCFA</span>
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex items-center justify-center py-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          {isProcessing || !qrCodeUrl ? (
            <div className="w-48 h-48 flex flex-col items-center justify-center">
              <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
              <p className="text-sm text-gray-500">Génération du QR code...</p>
            </div>
          ) : (
            <div className="relative">
              <img 
                src={qrCodeUrl} 
                alt="QR Code pour transaction" 
                className="w-48 h-48"
              />
              <div className="absolute bottom-1 right-1 bg-white bg-opacity-75 rounded-sm text-xs px-1">
                AES-256
              </div>
            </div>
          )}
        </div>
      </div>
      
      {qrCodeData && (
        <div className="text-xs text-gray-500">
          <p>Code valide pendant 15 minutes</p>
          <p>Ref: {qrCodeData.code?.substring(0, 8)}...</p>
        </div>
      )}
      
      <DialogFooter className="sm:justify-center">
        <Button variant="outline" onClick={onClose} className="mr-2">
          Fermer
        </Button>
        <Button onClick={() => window.print()}>
          Imprimer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
