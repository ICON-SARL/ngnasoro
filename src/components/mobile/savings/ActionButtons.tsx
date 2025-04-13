
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowDown, ArrowUp } from 'lucide-react';
import { SfdAccount } from '@/hooks/useSfdAccounts';

interface ActionButtonsProps {
  canDisplayBalance: boolean;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ canDisplayBalance }) => {
  const navigate = useNavigate();
  
  const handleDeposit = () => {
    navigate('/mobile-flow/deposit');
  };
  
  const handleWithdraw = () => {
    navigate('/mobile-flow/withdraw');
  };
  
  return (
    <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
      <Button 
        onClick={handleDeposit}
        className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center gap-2 py-6"
      >
        <ArrowDown className="h-5 w-5" />
        Dépôt
      </Button>
      <Button 
        onClick={handleWithdraw}
        className="bg-gray-800 hover:bg-gray-700 flex items-center gap-2 py-6"
        disabled={!canDisplayBalance}
      >
        <ArrowUp className="h-5 w-5" />
        Retrait
      </Button>
    </div>
  );
};

export default ActionButtons;
