import React, { useRef, useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Camera, CheckCircle, AlertCircle, X, Building2 } from 'lucide-react';
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [qrData, setQrData] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'scan' | 'confirm' | 'success'>('scan');

  // Start camera
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
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
        setScanning(true);
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
    setScanning(false);
  };

  const scanQRCode = () => {
    if (!scanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    if (video.readyState === video.HAVE_ENOUGH_DATA && context) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (code) {
        handleQRCodeDetected(code.data);
        return;
      }
    }

    requestAnimationFrame(scanQRCode);
  };

  const handleQRCodeDetected = (data: string) => {
    try {
      const parsed = JSON.parse(data);
      
      if (parsed.type !== 'cashier_station') {
        toast({
          title: 'QR code invalide',
          description: 'Ce QR code n\'est pas un code de caisse',
          variant: 'destructive',
        });
        return;
      }

      setQrData(parsed);
      setStep('confirm');
      stopCamera();
      
      toast({
        title: 'QR code scanné',
        description: `${parsed.station_name || 'Caisse détectée'}`,
      });
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'QR code invalide ou corrompu',
        variant: 'destructive',
      });
    }
  };

  const handleConfirmTransaction = async () => {
    if (!qrData || !amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer un montant valide',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-cashier-transaction', {
        body: {
          qr_code_data: JSON.stringify(qrData),
          amount: parseFloat(amount),
          transaction_type: transactionType,
        },
      });

      if (error) throw error;

      if (!data.success) {
        throw new Error(data.error || 'Transaction échouée');
      }

      setStep('success');
      
      toast({
        title: 'Succès',
        description: `${transactionType === 'deposit' ? 'Dépôt' : 'Retrait'} de ${amount} FCFA effectué`,
      });

      // Auto-close after success
      setTimeout(() => {
        onClose();
        resetState();
      }, 2000);

    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de traiter la transaction',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetState = () => {
    setQrData(null);
    setAmount('');
    setStep('scan');
    setProcessing(false);
  };

  const handleClose = () => {
    stopCamera();
    resetState();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'scan' && 'Scanner le QR code'}
            {step === 'confirm' && 'Confirmer la transaction'}
            {step === 'success' && 'Transaction réussie'}
          </DialogTitle>
          <DialogDescription>
            {step === 'scan' && 'Placez le QR code de la caisse dans le cadre'}
            {step === 'confirm' && `${qrData?.station_name || 'Caisse détectée'}`}
            {step === 'success' && 'Votre transaction a été traitée avec succès'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'scan' && (
            <div className="relative bg-black rounded-lg overflow-hidden aspect-square">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 border-4 border-white/50 rounded-lg"></div>
              </div>
              {scanning && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  Scan en cours...
                </div>
              )}
            </div>
          )}

          {step === 'confirm' && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-4 h-4" />
                  <span>Station</span>
                </div>
                <div className="font-semibold">{qrData?.station_name || 'Caisse Principale'}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Montant ({transactionType === 'deposit' ? 'Dépôt' : 'Retrait'})
                </label>
                <Input
                  type="number"
                  placeholder="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="text-lg"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Entrez le montant en FCFA
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep('scan');
                    startCamera();
                  }}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  onClick={handleConfirmTransaction}
                  disabled={processing || !amount || parseFloat(amount) <= 0}
                  className="flex-1"
                >
                  {processing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Traitement...
                    </>
                  ) : (
                    'Confirmer'
                  )}
                </Button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Transaction réussie</h3>
                <p className="text-muted-foreground">
                  {transactionType === 'deposit' ? 'Dépôt' : 'Retrait'} de {amount} FCFA
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
