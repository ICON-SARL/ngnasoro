
import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface BalanceSectionProps {
  currency: string;
}

const BalanceSection = ({ currency }: BalanceSectionProps) => {
  return (
    <div className="mb-4">
      <p className="text-gray-400 text-sm">Solde actuel</p>
      <div className="flex items-baseline">
        <h1 className="text-3xl font-bold">155 804</h1>
        <div className="ml-1 flex items-center">
          <span className="text-lg">.83</span>
          <Button variant="outline" size="sm" className="ml-2 h-7 text-xs border-gray-600 text-gray-300 rounded-xl">
            {currency} <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BalanceSection;
