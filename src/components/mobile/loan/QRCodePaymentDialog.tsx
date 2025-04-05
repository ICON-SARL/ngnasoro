
import React, { useState, useEffect, useRef } from 'react';
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
import { scanQRCodeForTransaction } from '@/utils/api/qrCodeGenerator';
import { useAuth } from '@/hooks/useAuth';
import jsQR from 'jsqr';

interface QRCodePaymentDialogProps {
  onClose: () => void;
  isWithdrawal?: boolean;
  amount?: number;
}

const QRCodePaymentDialog: React.FC<QRCodePaymentDialogProps> = ({ onClose, isWithdrawal = false, amount }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<null | {success: boolean; message: string}>(null);
  const [videoStream, setVideoStream] = useState<MediaStream | null>(null);
  const [processingScan, setProcessingScan] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const intervalRef = useRef<number | null>(null);
  
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
    
    // Start the scanning interval once the video is ready
    if (videoRef.current) {
      videoRef.current.onloadedmetadata = () => {
        startScanningInterval();
      };
    }
    
    return () => {
      if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
      }
      
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
      }
    };
  }, [toast]);
  
  const startScanningInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    intervalRef.current = window.setInterval(() => {
      if (scanning && !processingScan && videoRef.current && canvasRef.current) {
        captureAndProcessFrame();
      }
    }, 500); // Check for QR codes every 500ms
  };
  
  const captureAndProcessFrame = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (!video || !canvas || video.paused || video.ended || processingScan) return;
    
    const context = canvas.getContext('2d');
    if (!context) return;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to the canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    try {
      // Get image data from canvas for processing
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // Use jsQR to detect QR codes in the frame
      setProcessingScan(true);
      
      // Process the frame with jsQR
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: "dontInvert",
      });
      
      if (code) {
        console.log("QR code detected:", code.data);
        handleQRCodeDetected(code.data);
      } else {
        setProcessingScan(false);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
      setProcessingScan(false);
    }
  };
  
  // Process detected QR code
  const handleQRCodeDetected = async (code: string) => {
    console.log("QR Code detected:", code);
    
    if (!user) {
      toast({
        title: "Erreur d'authentification",
        description: "Vous devez être connecté pour effectuer cette opération",
        variant: "destructive",
      });
      setProcessingScan(false);
      return;
    }
    
    try {
      setScanning(false);
      
      // Call the API to verify and process the QR code
      const result = await scanQRCodeForTransaction(code, user.id);
      
      setScanResult({
        success: result.success,
        message: result.message
      });
      
      if (result.success) {
        toast({
          title: isWithdrawal ? "Retrait confirmé" : "Paiement confirmé",
          description: result.message,
        });
      } else {
        toast({
          title: "Échec",
          description: result.message || "Code QR invalide ou expiré",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('QR code processing error:', error);
      setScanResult({
        success: false,
        message: error.message || "Une erreur s'est produite lors du traitement"
      });
      
      toast({
        title: "Erreur",
        description: "Impossible de traiter le code QR. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setProcessingScan(false);
    }
  };
  
  // Manual capture button handler
  const handleManualCapture = () => {
    if (!processingScan) {
      captureAndProcessFrame();
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
                  <canvas ref={canvasRef} className="hidden"></canvas>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <Loader2 className="h-10 w-10 text-gray-400 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Vérification...</p>
                </div>
              )}
            </div>
            
            {scanning && !processingScan && (
              <Button 
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 hover:bg-blue-600"
                onClick={handleManualCapture}
              >
                <QrCodeIcon className="h-4 w-4 mr-2" /> Capturer
              </Button>
            )}
            
            {processingScan && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-white text-center">
                  <Loader2 className="h-10 w-10 animate-spin mx-auto mb-2" />
                  <p>Analyse du code QR...</p>
                </div>
              </div>
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
