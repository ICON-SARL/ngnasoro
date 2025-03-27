
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

interface FundsBalanceSectionProps {
  balance: number;
  onWithdraw: () => void;
  onDeposit: () => void;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({ 
  balance, 
  onWithdraw, 
  onDeposit 
}) => {
  return (
    <div className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white px-4 pb-6">
      <div className="mt-4 mb-6 flex flex-col items-center">
        <p className="text-sm mb-1">Solde disponible</p>
        <p className="text-3xl font-bold">{formatCurrencyAmount(balance)} FCFA</p>
        <div className="mt-4 flex space-x-3">
          <Button 
            onClick={onWithdraw}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-4 flex items-center"
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            Retirer
          </Button>
          <Button 
            onClick={onDeposit}
            className="bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-4 flex items-center"
          >
            <ArrowDown className="h-4 w-4 mr-2" />
            Déposer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FundsBalanceSection;
