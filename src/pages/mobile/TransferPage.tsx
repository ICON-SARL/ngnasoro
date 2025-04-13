
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TransferForm } from '@/components/mobile/transfers/TransferForm';
import { TransferHistory } from '@/components/mobile/transfers/TransferHistory';

export default function TransferPage() {
  const navigate = useNavigate();
  
  const handleBack = () => {
    navigate('/mobile-flow/main');
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 bg-white shadow-sm">
        <div className="flex items-center mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-0 mr-2 text-[#0D6A51]" 
            onClick={handleBack}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold text-[#0D6A51]">Transfert</h1>
        </div>
        <p className="text-gray-500 text-sm">Envoyez de l'argent facilement</p>
      </div>
      
      <div className="p-4 space-y-6">
        <TransferForm />
        
        <div className="mt-6">
          <TransferHistory />
        </div>
      </div>
    </div>
  );
}
