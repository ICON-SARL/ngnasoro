import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader } from '@/components/ui/loader';
import { Camera, CheckCircle, XCircle, Scan, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';
import { AmountDisplay } from '@/components/shared/AmountDisplay';
import jsQR from 'jsqr';

interface CashierQRScannerProps {
  isWithdrawal?: boolean;
  onSuccess?: (transaction: any) => void;
  onCancel?: () => void;
}

export function CashierQRScanner({ 
  isWithdrawal = false, 
  onSuccess, 
  onCancel 
}: CashierQRScannerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [amount, setAmount] = useState('');
  const [scannedQR, setScannedQR] = useState<string | null>(null);
  const [transactionResult, setTransactionResult] = useState<any>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationRef = useRef<number | null>(null);

  // Check camera permission
  useEffect(() => {
    checkCameraPermission();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission('granted');
    } catch {
      setCameraPermission('denied');
    }
  };

  const stopCamera = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  const startScanning = async () => {
    setScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        // Wait for video to be ready then start scanning
        videoRef.current.onloadedmetadata = () => {
          scanQRCode();
        };
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraPermission('denied');
      setScanning(false);
    }
  };

  const scanQRCode = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    if (!context || video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(scanQRCode);
      return;
    }
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert',
    });
    
    if (code) {
      stopCamera();
      setScanning(false);
      handleQRScanned(code.data);
    } else {
      animationRef.current = requestAnimationFrame(scanQRCode);
    }
  }, [scanning, stopCamera]);

  const handleQRScanned = async (qrData: string) => {
    setScannedQR(qrData);
    setScanning(false);
    
    toast({
      title: 'QR Code détecté',
      description: 'Entrez le montant de la transaction'
    });
  };

  const processTransaction = async () => {
    if (!scannedQR || !amount || parseFloat(amount) <= 0) {
      toast({
        title: 'Erreur',
        description: 'Veuillez scanner un QR code et entrer un montant valide',
        variant: 'destructive'
      });
      return;
    }

    try {
      setProcessing(true);

      const { data, error } = await supabase.functions.invoke('process-cashier-transaction', {
        body: {
          qr_code_data: scannedQR,
          amount: parseFloat(amount),
          transaction_type: isWithdrawal ? 'withdrawal' : 'deposit',
          user_id: user?.id
        }
      });

      if (error) throw error;

      if (data?.success) {
        setTransactionResult(data);
        
        toast({
          title: 'Transaction réussie!',
          description: `${isWithdrawal ? 'Retrait' : 'Dépôt'} de ${amount} FCFA effectué`
        });

        onSuccess?.(data.transaction);
      } else {
        throw new Error(data?.error || 'Transaction échouée');
      }
    } catch (error: any) {
      console.error('Transaction error:', error);
      toast({
        title: 'Erreur de transaction',
        description: error.message || 'Impossible de traiter la transaction',
        variant: 'destructive'
      });
    } finally {
      setProcessing(false);
    }
  };

  const resetScanner = () => {
    setScannedQR(null);
    setAmount('');
    setTransactionResult(null);
    setScanning(false);
  };

  // Transaction success view
  if (transactionResult) {
    return (
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="text-center">
          <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
          <CardTitle>Transaction Réussie</CardTitle>
          <CardDescription>
            {isWithdrawal ? 'Retrait' : 'Dépôt'} effectué avec succès
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="bg-background rounded-lg p-4 shadow-sm border">
            <p className="text-sm text-muted-foreground mb-1">Montant</p>
            <p className="text-3xl font-bold text-primary">
              <AmountDisplay amount={parseFloat(amount)} />
            </p>
          </div>
          
          {transactionResult.new_balance !== undefined && (
            <div className="bg-background rounded-lg p-4 shadow-sm border">
              <p className="text-sm text-muted-foreground mb-1">Nouveau solde</p>
              <p className="text-2xl font-semibold">
                <AmountDisplay amount={transactionResult.new_balance} />
              </p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button 
              variant="outline" 
              onClick={resetScanner}
              className="flex-1"
            >
              Nouvelle transaction
            </Button>
            <Button 
              onClick={onCancel}
              className="flex-1"
            >
              Terminer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Camera permission denied
  if (cameraPermission === 'denied') {
    return (
      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader className="text-center">
          <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <CardTitle>Accès caméra refusé</CardTitle>
          <CardDescription>
            L'accès à la caméra est nécessaire pour scanner le QR code du guichet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Veuillez autoriser l'accès à la caméra dans les paramètres de votre navigateur
          </p>
          <Button variant="outline" onClick={onCancel} className="w-full">
            Annuler
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          {isWithdrawal ? (
            <>
              <ArrowDownCircle className="h-5 w-5 text-destructive" />
              Retrait au guichet
            </>
          ) : (
            <>
              <ArrowUpCircle className="h-5 w-5 text-primary" />
              Dépôt au guichet
            </>
          )}
        </CardTitle>
        <CardDescription>
          Scannez le QR code affiché au guichet de la SFD
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Hidden video and canvas for QR scanning */}
        <video ref={videoRef} className={scanning ? "w-full rounded-lg" : "hidden"} playsInline muted />
        <canvas ref={canvasRef} className="hidden" />
        
        {/* QR Scanner Area */}
        {!scannedQR && (
          <div className="relative">
            {scanning ? (
              <div className="flex flex-col items-center justify-center py-4">
                <Loader size="lg" className="mb-4" />
                <p className="text-sm text-muted-foreground">Recherche de QR code...</p>
                <p className="text-xs text-muted-foreground mt-1">Pointez vers le QR du guichet</p>
              </div>
            ) : (
              <div 
                onClick={startScanning}
                className="aspect-square bg-muted rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-muted-foreground/50 cursor-pointer hover:border-primary transition-colors"
              >
                <Camera className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-sm font-medium">Appuyez pour scanner</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Scanner le QR code du guichet
                </p>
              </div>
            )}
            
            <Button
              variant="default"
              className="w-full mt-4"
              onClick={startScanning}
              disabled={scanning}
            >
              <Scan className="h-4 w-4 mr-2" />
              {scanning ? 'Scan en cours...' : 'Lancer le scanner'}
            </Button>
          </div>
        )}

        {/* Amount input after QR scanned */}
        {scannedQR && (
          <div className="space-y-4">
            <div className="bg-primary/5 p-4 rounded-lg text-center border border-primary/20">
              <CheckCircle className="h-8 w-8 text-primary mx-auto mb-2" />
              <p className="text-sm font-medium">QR Code validé</p>
              <p className="text-xs text-muted-foreground">Guichet de caisse identifié</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Montant ({isWithdrawal ? 'à retirer' : 'à déposer'})</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Entrez le montant en FCFA"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                className="text-lg font-medium"
              />
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={resetScanner}
                className="flex-1"
              >
                Annuler
              </Button>
              <Button 
                onClick={processTransaction}
                disabled={processing || !amount || parseFloat(amount) <= 0}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <Loader size="sm" className="mr-2" />
                    Traitement...
                  </>
                ) : (
                  <>
                    {isWithdrawal ? 'Confirmer retrait' : 'Confirmer dépôt'}
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Cancel button when not scanning */}
        {!scannedQR && !scanning && (
          <Button variant="outline" onClick={onCancel} className="w-full">
            Annuler
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
