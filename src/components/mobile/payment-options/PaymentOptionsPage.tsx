
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { PaymentOptions } from '@/components/PaymentOptions';

const PaymentOptionsPage: React.FC = () => {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="bg-gray-50 min-h-screen pb-20">
      <div className="bg-white p-4 shadow-sm flex items-center">
        <Button 
          variant="ghost" 
          className="p-1 mr-2" 
          onClick={handleBack}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="font-semibold text-lg">Options de paiement</h1>
      </div>
      
      <div className="p-4">
        <PaymentOptions />
      </div>
    </div>
  );
};

export default PaymentOptionsPage;
