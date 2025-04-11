
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TransferOptionsProps {
  onWithdraw: () => void;
  onDeposit: () => void;
}

const TransferOptions: React.FC<TransferOptionsProps> = ({ onWithdraw, onDeposit }) => {
  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-slate-800 mb-4">Options de transfert</h2>
      <div className="grid grid-cols-2 gap-4">
        <Button
          onClick={onWithdraw}
          className="h-auto py-5 px-4 flex flex-col items-center bg-[#FEF7CD] text-slate-800 hover:bg-[#FEF7CD]/90 border border-transparent shadow-sm rounded-xl"
          variant="ghost"
        >
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full mb-2 shadow-sm">
            <ArrowUp className="h-5 w-5 text-amber-500" />
          </div>
          <span className="text-base font-medium">Retrait</span>
        </Button>
        
        <Button
          onClick={onDeposit}
          className="h-auto py-5 px-4 flex flex-col items-center bg-[#F2FCE2] text-slate-800 hover:bg-[#F2FCE2]/90 border border-transparent shadow-sm rounded-xl"
          variant="ghost"
        >
          <div className="h-10 w-10 flex items-center justify-center bg-white rounded-full mb-2 shadow-sm">
            <ArrowDown className="h-5 w-5 text-green-500" />
          </div>
          <span className="text-base font-medium">Dépôt</span>
        </Button>
      </div>
    </div>
  );
};

export default TransferOptions;
