
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQRCodeGeneration } from '@/hooks/mobile-money';
import { Loader } from '@/components/ui/loader';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  amount?: number;
  isWithdrawal?: boolean;
  loanId?: string;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ 
  onClose, 
  amount = 3500, 
  isWithdrawal = false,
  loanId 
}) => {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [expirationTime, setExpirationTime] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { isProcessingQRCode, generatePaymentQRCode, generateWithdrawalQRCode } = useQRCodeGeneration();
  
  useEffect(() => {
    const generateCode = async () => {
      setLoading(true);
      try {
        const response = isWithdrawal
          ? await generateWithdrawalQRCode(amount)
          : await generatePaymentQRCode(amount, loanId);
        
        if (response.success && response.qrCodeData) {
          setQrCodeData(response.qrCodeData);
          if (response.expiration) {
            setExpirationTime(new Date(response.expiration).toLocaleTimeString('fr-FR'));
          }
        } else {
          setError(response.error || 'Erreur lors de la génération du code QR');
        }
      } catch (err) {
        setError('Erreur lors de la génération du code QR');
      } finally {
        setLoading(false);
      }
    };
    
    generateCode();
  }, [amount, isWithdrawal, loanId]);
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>
          {isWithdrawal ? "QR Code pour retrait" : "QR Code pour paiement"}
        </DialogTitle>
        <DialogDescription>
          Présentez ce code en agence pour 
          {isWithdrawal ? " effectuer votre retrait." : " effectuer votre paiement."}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center p-4">
        {loading || isProcessingQRCode ? (
          <div className="flex flex-col items-center justify-center h-64">
            <Loader size="lg" className="mb-4" />
            <p className="text-gray-500">Génération du code QR...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="bg-red-100 rounded-full p-3 mb-3">
              <QrCode className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="font-medium mb-2 text-red-600">Erreur</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </div>
        ) : (
          <>
            <div className="border-4 border-gray-100 p-2 rounded-lg mb-4">
              {qrCodeData ? (
                <img 
                  src={qrCodeData} 
                  alt="QR Code pour paiement" 
                  className="w-64 h-64"
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 flex items-center justify-center">
                  <QrCode className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="text-center">
              <p className="text-sm font-medium">
                Montant: {amount.toLocaleString()} FCFA
              </p>
              {expirationTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Ce code expire à {expirationTime}
                </p>
              )}
            </div>
          </>
        )}
      </div>
      
      <DialogFooter className="sm:justify-center">
        <Button type="button" variant="secondary" onClick={onClose}>
          Fermer
        </Button>
        {!loading && !error && (
          <Button type="button" onClick={() => window.print()}>
            Imprimer
          </Button>
        )}
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
