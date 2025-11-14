import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Store, Check, Loader2, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import jsQR from 'jsqr';

interface CashierQRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  transactionType: 'deposit' | 'withdrawal';
}

export const CashierQRScanner: React.FC<CashierQRScannerProps> = ({
  isOpen,
  onClose,
  transactionType,
}) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'scan' | 'amount' | 'confirm' | 'success'>('scan');
  const [qrData, setQrData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen && step === 'scan') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, step]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      if (videoRef) {
        videoRef.srcObject = mediaStream;
        videoRef.play();
        scanQRCode();
      }
    } catch (error) {
      console.error('Camera error:', error);
      toast({
        title: 'Erreur caméra',
        description: 'Impossible d\'accéder à la caméra',
        variant: 'destructive',
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const scanQRCode = () => {
    if (!videoRef || step !== 'scan') return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) return;

    canvas.width = videoRef.videoWidth;
    canvas.height = videoRef.videoHeight;
    context.drawImage(videoRef, 0, 0, canvas.width, canvas.height);

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (code) {
      handleQRCodeScanned(code.data);
    } else {
      requestAnimationFrame(scanQRCode);
    }
  };

  const handleQRCodeScanned = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      if (parsed.type === 'cashier_station') {
        setQrData(parsed);
        stopCamera();
        setStep('amount');
        toast({
          title: 'QR code scanné',
          description: `Caisse: ${parsed.station_name}`,
        });
      } else {
        toast({
          title: 'QR code invalide',
          description: 'Ce QR code n\'est pas un code de caisse',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Erreur de scan',
        description: 'QR code illisible',
        variant: 'destructive',
      });
    }
  };

  const handleAmountSubmit = () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) {
      toast({
        title: 'Montant invalide',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirm');
  };

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('process-cashier-transaction', {
        body: {
          qrCodeData: JSON.stringify(qrData),
          amount: parseFloat(amount),
          transactionType,
        }
      });

      if (error) throw error;

      if (data?.success) {
        setStep('success');
        toast({
          title: 'Transaction réussie',
          description: `${transactionType === 'deposit' ? 'Dépôt' : 'Retrait'} de ${amount} FCFA effectué`,
        });

        setTimeout(() => {
          onClose();
          resetState();
        }, 3000);
      } else {
        throw new Error(data?.error || 'Transaction échouée');
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Transaction échouée',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetState = () => {
    setStep('scan');
    setQrData(null);
    setAmount('');
    setIsProcessing(false);
    stopCamera();
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'scan' && 'Scanner le QR code'}
            {step === 'amount' && 'Montant'}
            {step === 'confirm' && 'Confirmation'}
            {step === 'success' && 'Succès'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'scan' && (
            <div className="relative">
              <video
                ref={setVideoRef}
                className="w-full h-64 bg-black rounded-lg object-cover"
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-48 h-48 border-4 border-[#0D6A51] rounded-2xl"></div>
              </div>
              <p className="text-center text-sm text-gray-600 mt-4">
                Positionnez le QR code de la caisse dans le cadre
              </p>
            </div>
          )}

          {step === 'amount' && qrData && (
            <div className="space-y-4">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-4 rounded-2xl border-2 border-emerald-200">
                <div className="flex items-center gap-3 mb-2">
                  <Store className="w-5 h-5 text-[#0D6A51]" />
                  <div>
                    <p className="font-semibold text-gray-800">{qrData.station_name}</p>
                    <p className="text-sm text-gray-600">{qrData.sfd_name}</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant ({transactionType === 'deposit' ? 'Dépôt' : 'Retrait'})
                </label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0"
                  className="text-2xl font-bold text-center"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">FCFA</p>
              </div>

              <Button onClick={handleAmountSubmit} className="w-full" size="lg">
                Continuer <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-2xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Caisse</span>
                  <span className="font-semibold">{qrData.station_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold">
                    {transactionType === 'deposit' ? 'Dépôt' : 'Retrait'}
                  </span>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <span className="text-gray-600">Montant</span>
                  <span className="text-2xl font-bold text-[#0D6A51]">{amount} FCFA</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => setStep('amount')} variant="outline" className="flex-1">
                  Retour
                </Button>
                <Button onClick={handleConfirm} disabled={isProcessing} className="flex-1">
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Confirmer</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Transaction réussie !</h3>
              <p className="text-gray-600">
                {transactionType === 'deposit' ? 'Dépôt' : 'Retrait'} de {amount} FCFA
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Fermeture automatique...
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
