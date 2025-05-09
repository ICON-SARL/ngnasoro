
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp, Send, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransferOptionsProps {
  onDeposit?: () => void;
  onWithdraw?: () => void;
}

const TransferOptions: React.FC<TransferOptionsProps> = ({ 
  onDeposit,
  onWithdraw
}) => {
  const navigate = useNavigate();

  const handleTransfer = () => {
    navigate('/mobile-flow/transfers');
  };

  const handleLoan = () => {
    navigate('/mobile-flow/loan-application');
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center p-6 h-auto border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        onClick={onDeposit}
      >
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
          <ArrowDown className="h-5 w-5 text-green-600" />
        </div>
        <span className="mt-2 font-medium">Dépôt</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center p-6 h-auto border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        onClick={onWithdraw}
      >
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
          <ArrowUp className="h-5 w-5 text-red-600" />
        </div>
        <span className="mt-2 font-medium">Retrait</span>
      </Button>

      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center p-6 h-auto border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        onClick={handleTransfer}
      >
        <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-2">
          <Send className="h-5 w-5 text-blue-600" />
        </div>
        <span className="mt-2 font-medium">Transfert</span>
      </Button>
      
      <Button 
        variant="outline" 
        className="flex flex-col items-center justify-center p-6 h-auto border border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        onClick={handleLoan}
      >
        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mb-2">
          <CreditCard className="h-5 w-5 text-purple-600" />
        </div>
        <span className="mt-2 font-medium">Prêt</span>
      </Button>
    </div>
  );
};

export default TransferOptions;
