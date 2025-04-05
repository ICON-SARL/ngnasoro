
import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCodeIcon, Scan } from 'lucide-react';

interface QRCodeSectionProps {
  isWithdrawal: boolean;
  onScanQRCode: () => void;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ isWithdrawal, onScanQRCode }) => {
  return (
    <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
      <h3 className="font-semibold flex items-center gap-2 mb-2">
        <QrCodeIcon className="h-5 w-5" /> 
        {isWithdrawal ? 'Retrait en agence SFD' : 'Paiement en agence SFD'}
      </h3>
      
      <p className="text-sm text-gray-600 mb-4">
        {isWithdrawal 
          ? "Scannez le code QR disponible en agence SFD pour effectuer votre retrait en espèces."
          : "Scannez le code QR disponible en agence SFD pour effectuer votre paiement en espèces."
        }
      </p>
      
      <Button 
        onClick={onScanQRCode} 
        className="w-full flex items-center justify-center gap-2"
      >
        <Scan className="h-4 w-4" />
        Scanner le code QR
      </Button>
    </div>
  );
};

export default QRCodeSection;
