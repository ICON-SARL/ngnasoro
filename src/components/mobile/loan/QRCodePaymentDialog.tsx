
import React, { useState, useEffect } from 'react';
import { QrCodeIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { verifyQRCode } from '@/utils/api/qrCodeGenerator';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  isWithdrawal?: boolean;
  amount?: number; // Add the amount prop to the interface
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ onClose, isWithdrawal = false, amount }) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | {success: boolean; message: string}>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // Start scanner
  useEffect(() => {
    const startScanner = async () => {
      try {
        setScanning(true);
        const constraints = {
          video: {
            facingMode: 'environment'
          }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setVideoStream(stream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
          title: "Erreur",
          description: "Impossible d'accéder à la caméra. Veuillez vérifier vos permissions.",
          variant: "destructive",
        });
      }
    };
    
    startScanner();
    
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [toast]);
  
  // Mock function to simulate QR code scanning
  // In a real app, this would be replaced with an actual QR code scanner library
  const handleScanQRCode = async () => {
    setScanning(false);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    try {
      // In a real implementation, the code would come from the scanned QR code
      const mockQRCode = "QR" + Math.random().toString(36).substr(2, 8);
      
      // Call the API to verify the QR code
      const verified = await verifyQRCode(mockQRCode);
      
      if (verified) {
        setScanResult({
          success: true,
          message: isWithdrawal 
            ? "Retrait en espèces confirmé" 
            : "Paiement en espèces confirmé"
        });
      } else {
        setScanResult({
          success: false,
          message: "Code QR invalide ou expiré"
        });
      }
    } catch (error) {
      console.error('Error verifying QR code:', error);
      setScanResult({
        success: false,
        message: "Une erreur s'est produite lors de la vérification"
      });
    }
  };
  
  // Get transaction amount display
  const displayAmount = amount ? `${amount.toLocaleString()} FCFA` : '';
  
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle className="text-center">Scanner le Code QR</DialogTitle>
        <DialogDescription className="text-center">
          Scannez le code QR généré par l'agence SFD pour {isWithdrawal ? 'effectuer votre retrait' : 'effectuer votre paiement'}.
          {displayAmount && <div className="font-semibold mt-1">{displayAmount}</div>}
        </DialogDescription>
      </DialogHeader>
      
      <div className="flex items-center justify-center py-6">
        {!scanResult ? (
          <div className="relative">
            <div className="bg-white p-4 rounded-lg shadow-sm border min-h-[256px] min-w-[256px] flex items-center justify-center">
              {scanning ? (
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-full"
                    autoPlay
                    playsInline
                    style={{ maxWidth: '240px', maxHeight: '240px' }}
                  />
                  <div className="absolute inset-0 border-2 border-blue-500 pointer-events-none"></div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Vérification...</p>
                </div>
              )}
            </div>
            
            {scanning && (
              <Button 
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600"
                onClick={handleScanQRCode}
              >
                <QrCodeIcon className="h-4 w-4 mr-2" /> Capturer
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
            {scanResult.success ? (
              <div className="text-green-600">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xl font-semibold mb-2">{scanResult.message}</p>
                <p className="text-sm text-gray-500">Transaction réussie</p>
                {displayAmount && <p className="mt-2 font-medium">{displayAmount}</p>}
              </div>
            ) : (
              <div className="text-red-600">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-xl font-semibold mb-2">Échec</p>
                <p className="text-gray-500">{scanResult.message}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      <DialogFooter className="flex flex-col">
        <Button variant="outline" onClick={onClose} className="w-full">
          Fermer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default QRCodePaymentDialog;
