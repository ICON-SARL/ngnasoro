
import React, { useState, useEffect } from 'react';
import { Download, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  amount?: number;
  isWithdrawal?: boolean;
}

const QRCodePaymentDialog = ({ onClose, amount = 3500, isWithdrawal = false }: QRCodePaymentDialogProps) => {
  const { toast } = useToast();
  const [qrGenerated, setQrGenerated] = useState(false);
  const [qrExpiry, setQrExpiry] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState('');
  const [qrCode, setQrCode] = useState('');

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

  const handleGenerateQrCode = async () => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erreur d'authentification",
          description: "Veuillez vous connecter pour générer un QR code",
          variant: "destructive",
        });
        return;
      }
      
      // Call the Edge Function to generate a QR code
      const { data, error } = await supabase.functions.invoke('qr-code-verification/generate', {
        method: 'POST',
        body: {
          userId: user.id,
          loanId: "LOAN123", // Placeholder - would be real loan ID in production
          amount: amount,
          isWithdrawal: isWithdrawal
        },
      });
      
      if (error) {
        console.error('QR Code generation error:', error);
        toast({
          title: "Erreur",
          description: "Impossible de générer le QR code",
          variant: "destructive",
        });
        return;
      }
      
      const expiryDate = new Date(data.expiresAt);
      setQrExpiry(expiryDate);
      setQrGenerated(true);
      setQrCode(data.code);
      
      toast({
        title: "QR Code généré",
        description: "Ce code est valable pendant 15 minutes. Présentez-le à l'agent SFD pour effectuer votre opération.",
      });
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la génération du QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>
          {isWithdrawal ? "Retrait en agence SFD" : "Paiement en agence SFD"}
        </DialogTitle>
      </DialogHeader>
      <div className="space-y-4">
        {!qrGenerated ? (
          <>
            <p className="text-sm">
              {isWithdrawal 
                ? "Générez un QR code unique que vous présenterez à l'agent SFD pour effectuer votre retrait."
                : "Générez un QR code unique que vous présenterez à l'agent SFD pour effectuer votre paiement."
              } Le code est valable 15 minutes.
            </p>
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
              {isWithdrawal 
                ? `Présentez ce code à l'agent SFD pour effectuer votre retrait de ${amount.toLocaleString()} FCFA`
                : `Présentez ce code à l'agent SFD pour effectuer votre paiement de ${amount.toLocaleString()} FCFA`
              }
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
