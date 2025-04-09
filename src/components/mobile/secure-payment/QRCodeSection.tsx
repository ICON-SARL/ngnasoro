
import React from 'react';
import { Button } from '@/components/ui/button';
import { QrCode } from 'lucide-react';

interface QRCodeSectionProps {
  isWithdrawal: boolean;
  onScanQRCode: () => void;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ isWithdrawal, onScanQRCode }) => {
  return (
    <div className="bg-white border border-gray-100 rounded-lg p-4 shadow-sm flex flex-col items-center justify-center">
      <QrCode className="h-10 w-10 text-gray-400 mb-2" />
      <h3 className="text-lg font-medium mb-1">
        {isWithdrawal ? "Retrait en agence SFD" : "Paiement en agence SFD"}
      </h3>
      <p className="text-gray-500 text-sm text-center mb-3">
        Générez un QR code à présenter en agence pour effectuer
        {isWithdrawal ? " votre retrait" : " votre paiement"}
      </p>
      <Button 
        variant="outline" 
        className="w-full"
        onClick={onScanQRCode}
      >
        Générer un QR code
      </Button>
    </div>
  );
};

export default QRCodeSection;
