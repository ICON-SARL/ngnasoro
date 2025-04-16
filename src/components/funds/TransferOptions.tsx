
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowDownUp, Wallet } from 'lucide-react';

interface TransferOptionsProps {
  onDeposit: () => void;
  onWithdraw: () => void;
}

const TransferOptions = ({ onDeposit, onWithdraw }: TransferOptionsProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card 
        className="cursor-pointer hover:border-[#0D6A51] transition-colors"
        onClick={onDeposit}
      >
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-[#0D6A51]/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <Wallet className="h-6 w-6 text-[#0D6A51]" />
          </div>
          <h3 className="font-medium text-gray-900">Dépôt</h3>
          <p className="text-sm text-gray-500">Mobile Money</p>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer hover:border-[#0D6A51] transition-colors"
        onClick={onWithdraw}
      >
        <CardContent className="p-4 text-center">
          <div className="w-12 h-12 bg-[#0D6A51]/10 rounded-full flex items-center justify-center mx-auto mb-2">
            <ArrowDownUp className="h-6 w-6 text-[#0D6A51]" />
          </div>
          <h3 className="font-medium text-gray-900">Retrait</h3>
          <p className="text-sm text-gray-500">Mobile Money</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransferOptions;
