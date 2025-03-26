
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
      <p className="text-sm text-white/70 uppercase tracking-wide mb-1">APPROVED LIMIT UP TO</p>
      <h1 className="text-4xl font-bold text-white mb-3">₹ {new Intl.NumberFormat('en-IN').format(5000)}</h1>
      
      <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white/90">I want money</p>
          <div className="flex items-center text-green-300">
            <ArrowUp className="h-3 w-3 mr-1" />
            <span className="text-sm">₹ {new Intl.NumberFormat('en-IN').format(3250)}</span>
          </div>
        </div>
        
        <div className="w-full h-1.5 bg-white/20 rounded-full mb-1.5">
          <div 
            className="h-1.5 bg-white rounded-full" 
            style={{ width: '65%' }}
          ></div>
        </div>
        
        <div className="flex justify-between text-xs text-white/60">
          <span>1000</span>
          <span>2500</span>
          <span>3000</span>
          <span>4000</span>
          <span>5000</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-2">
        <Button variant="outline" className="flex items-center justify-center py-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
          <ArrowUp className="mr-2 h-5 w-5" />
          Send
        </Button>
        <Button variant="outline" className="flex items-center justify-center py-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm">
          <ArrowDown className="mr-2 h-5 w-5" />
          Receive
        </Button>
      </div>
    </div>
  );
};

export default BalanceSection;
