
import React from 'react';
import { ArrowUp, ArrowDown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface BalanceSectionProps {
  currency: string;
  balance: number;
}

const BalanceSection = ({ currency, balance }: BalanceSectionProps) => {
  return (
    <div className="flex flex-col">
      <p className="text-sm text-white/70 uppercase tracking-wide mb-1">SOLDE TOTAL MULTI-SFD</p>
      <h1 className="text-4xl font-bold text-white mb-3">{currency} {new Intl.NumberFormat('fr-FR').format(balance/1000)}</h1>
      <div className="flex items-center mb-4">
        <div className="flex items-center text-green-300 mr-4">
          <ArrowUp className="h-3 w-3 mr-1" />
          <span className="text-sm">+2.4%</span>
        </div>
        <div className="px-2 py-1 rounded-full bg-white/20 text-white text-xs flex items-center">
          <Building className="h-3 w-3 mr-1" />
          2 SFDs connectés
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button variant="outline" className="flex items-center justify-center py-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
          <ArrowUp className="mr-2 h-5 w-5" />
          Envoyer
        </Button>
        <Button variant="outline" className="flex items-center justify-center py-4 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
          <ArrowDown className="mr-2 h-5 w-5" />
          Recevoir
        </Button>
      </div>
    </div>
  );
};

export default BalanceSection;
