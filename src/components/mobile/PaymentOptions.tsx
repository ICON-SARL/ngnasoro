
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { QrCode, Smartphone, ChevronRight } from 'lucide-react';

interface PaymentOptionsProps {
  onQRScan?: () => void;
  onMobileMoney?: () => void;
  redirectPath?: string;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ 
  onQRScan, 
  onMobileMoney, 
  redirectPath 
}) => {
  const navigate = useNavigate();
  
  const handleQRClick = () => {
    if (onQRScan) {
      onQRScan();
    } else if (redirectPath) {
      navigate(`${redirectPath}?method=qr`);
    }
  };
  
  const handleMobileMoneyClick = () => {
    if (onMobileMoney) {
      onMobileMoney();
    } else if (redirectPath) {
      navigate(`${redirectPath}?method=mobile`);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card 
        className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        onClick={handleQRClick}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <QrCode className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">Scanner un QR code</h3>
              <p className="text-sm text-gray-500">Payer à partir d'un code QR</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </CardContent>
      </Card>
      
      <Card 
        className="cursor-pointer shadow-sm hover:shadow-md transition-shadow"
        onClick={handleMobileMoneyClick}
      >
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-2 rounded-full">
              <Smartphone className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-medium">Mobile Money</h3>
              <p className="text-sm text-gray-500">Payer avec Mobile Money</p>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-gray-400" />
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentOptions;
