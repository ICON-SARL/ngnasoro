
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Camera, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { scanQRCodeForTransaction } from '@/utils/api/qrCodeGenerator';
import { useAuth } from '@/hooks/useAuth';

interface QRCodeScannerDialogProps {
  onClose: () => void;
  onSuccess?: (transactionData: any) => void;
  isWithdrawal?: boolean;
}

const QRCodeScannerDialog: React.FC<QRCodeScannerDialogProps> = ({
  onClose,
  onSuccess,
  isWithdrawal = false
}) => {
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const [qrScanned, setQrScanned] = useState(false);
  
  // Request camera permission
  useEffect(() => {
    const requestCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraPermission(true);
        // Stop the stream right away as we'll start it later
        stream.getTracks().forEach(track => track.stop());
      } catch (err) {
        console.error('Error requesting camera permission:', err);
        setCameraPermission(false);
        setError('Veuillez autoriser l\'accès à la caméra pour scanner le code QR');
      }
    };
    
    requestCameraPermission();
  }, []);
  
  // Function to handle QR code scanning
  const handleScan = async (qrCode: string) => {
    if (!user?.id || qrScanned) return;
    
    setQrScanned(true);
    setScanning(true);
    
    try {
      const response = await scanQRCodeForTransaction(qrCode, user.id);
      
      if (response.success) {
        toast({
          title: "Transaction réussie",
          description: response.message,
          variant: "default",
        });
        
        if (onSuccess) {
          onSuccess(response.transaction);
        }
        
        onClose();
      } else {
        setError(response.message || "Code QR invalide");
        setQrScanned(false);
        setScanning(false);
      }
    } catch (err: any) {
      console.error('Error scanning QR code:', err);
      setError(err.message || "Une erreur est survenue lors du scan");
      setQrScanned(false);
      setScanning(false);
    }
  };
  
  // This would be a real implementation in a production app
  // For our demo, we'll simulate scanning after a delay
  const startScanner = () => {
    setScanning(true);
    setError(null);
    
    // Simulate finding a QR code after 3 seconds
    setTimeout(() => {
      const mockQrCode = `SFD${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
      handleScan(mockQrCode);
    }, 3000);
  };
  
  if (cameraPermission === false) {
    return (
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Scanner le code QR</DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-6">
          <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
          <p className="text-center mb-4">
            Vous devez autoriser l'accès à la caméra pour scanner le code QR. 
            Veuillez actualiser la page et réessayer.
          </p>
          <Button onClick={onClose}>Fermer</Button>
        </div>
      </DialogContent>
    );
  }
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center">
          Scanner le code QR de l'agence SFD
        </DialogTitle>
      </DialogHeader>
      
      <div className="flex flex-col items-center justify-center p-4">
        {scanning ? (
          <div className="relative w-64 h-64 bg-gray-100 rounded-lg overflow-hidden mb-4 flex items-center justify-center">
            {/* This would be a real camera view in a production app */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-40 h-40 border-2 border-primary/60 border-dashed rounded-lg animate-pulse"></div>
            </div>
            
            <Loader2 className="h-8 w-8 animate-spin text-primary absolute" />
          </div>
        ) : (
          <div className="w-64 h-64 bg-gray-100 rounded-lg flex flex-col items-center justify-center mb-4">
            <Camera className="h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-center text-gray-500">
              Appuyez sur le bouton ci-dessous pour activer la caméra et scanner 
              le code QR affiché en agence SFD.
            </p>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-md mb-4 text-sm">
            {error}
          </div>
        )}
        
        <p className="text-sm text-center mb-4">
          {isWithdrawal 
            ? "Scannez le code QR disponible en agence SFD pour effectuer votre retrait."
            : "Scannez le code QR disponible en agence SFD pour effectuer votre paiement."}
        </p>
      </div>
      
      <DialogFooter className="sm:justify-between">
        <Button 
          variant="outline" 
          onClick={onClose}
        >
          Annuler
        </Button>
        
        <Button 
          onClick={startScanner} 
          disabled={scanning}
          className="gap-2"
        >
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          {scanning ? "Scan en cours..." : "Scanner le code QR"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodeScannerDialog;
