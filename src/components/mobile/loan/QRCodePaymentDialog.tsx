
import React, { useState, useEffect } from 'react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface QRCodePaymentDialogProps {
  onClose: () => void;
}

const QRCodePaymentDialog = ({ onClose }: QRCodePaymentDialogProps) => {
  const { toast } = useToast();
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrExpiry, setQrExpiry] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');

  // Countdown timer for QR code expiry
  useEffect(() => {
    if (!qrExpiry) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      const diff = qrExpiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        setCountdown('Expiré');
        setQrGenerated(false);
        clearInterval(interval);
        return;
      }
      
      const minutes = Math.floor(diff / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [qrExpiry]);

  const handleGenerateQrCode = () => {
    const expiryDate = new Date();
    expiryDate.setMinutes(expiryDate.getMinutes() + 15); // 15 minutes expiry
    
    setQrExpiry(expiryDate);
    setQrGenerated(true);
    
    toast({
      title: "QR Code généré",
      description: "Ce code est valable pendant 15 minutes. Présentez-le à l'agent SFD pour effectuer votre paiement.",
    });
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Paiement en agence SFD</DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {!qrGenerated ? (
          <>
            <p className="text-sm">Générez un QR code unique que vous présenterez à l'agent SFD pour effectuer votre paiement. Le code est valable 15 minutes.</p>
            <Button onClick={handleGenerateQrCode} className="w-full">
              Générer le QR code
            </Button>
          </>
        ) : (
          <div className="text-center">
            <div className="mx-auto h-48 w-48 bg-white border-2 border-gray-200 rounded-md flex flex-col items-center justify-center mb-4">
              <QrCode className="h-32 w-32 text-teal-600 mb-2" />
              <div className="text-sm font-medium bg-yellow-100 px-3 py-1 rounded-full text-yellow-800">
                Expire dans: {countdown}
              </div>
            </div>
            <p className="text-sm font-medium text-green-600 mb-2">QR Code généré avec succès</p>
            <p className="text-xs text-gray-500 mb-4">
              Présentez ce code à l'agent SFD pour effectuer votre paiement de 3 500 FCFA
            </p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => setQrGenerated(false)} className="flex-1">
                Annuler
              </Button>
              <Button onClick={() => window.print()} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Télécharger
              </Button>
            </div>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
