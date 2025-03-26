
import React from 'react';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BalanceSectionProps {
  currency: string;
  balance: number;
}

const BalanceSection = ({ currency, balance }: BalanceSectionProps) => {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-white/70 uppercase tracking-wide mb-1">TOTAL BALANCE</p>
      <h1 className="text-4xl font-bold text-white mb-5">${new Intl.NumberFormat('en-US').format(balance/1000)}</h1>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button variant="outline" className="flex items-center justify-center py-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
          <ArrowUp className="mr-2 h-5 w-5" />
          Send
        </Button>
        <Button variant="outline" className="flex items-center justify-center py-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
          <ArrowDown className="mr-2 h-5 w-5" />
          Receive
        </Button>
      </div>
    </div>
  );
};

export default BalanceSection;
