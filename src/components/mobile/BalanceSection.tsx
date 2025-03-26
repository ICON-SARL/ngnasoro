
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Building } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';

interface BalanceSectionProps {
  currency?: string;
  balance?: number;
  onAction?: (action: string, data?: any) => void;
}

const BalanceSection = ({ 
  currency = "FCFA", 
  balance = 0,
  onAction
}: BalanceSectionProps) => {
  const navigate = useNavigate();
  const [sliderValue, setSliderValue] = useState(65);
  const [amountNeeded, setAmountNeeded] = useState(3250);
  
  const maxApprovedLimit = 5000;
  
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    
    // Calculate amount based on slider percentage
    const calculatedAmount = Math.round((newValue / 100) * maxApprovedLimit);
    setAmountNeeded(calculatedAmount);
  };
  
  const handleSendClick = () => {
    if (onAction) {
      onAction('Send');
    } else {
      navigate('/mobile-flow/payment');
    }
  };
  
  const handleReceiveClick = () => {
    if (onAction) {
      onAction('Receive');
    } else {
      navigate('/mobile-flow/secure-payment');
    }
  };

  const handleLoansClick = () => {
    if (onAction) {
      onAction('Loans');
    } else {
      navigate('/mobile-flow/home-loan');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount);
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/70 uppercase tracking-wide mb-1">
          APPROVED LIMIT UP TO <span>↗</span>
        </p>
        <div className="flex items-center bg-white/20 rounded-full px-3 py-1 text-xs text-white">
          <Building className="h-3 w-3 mr-1" />
          <span>SFD Primaire</span>
        </div>
      </div>
      
      <h1 className="text-4xl font-bold text-white mb-3">
        {currency} {formatCurrency(maxApprovedLimit)}
      </h1>
      
      <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm text-white/90">I want money</p>
          <div className="h-6 w-6 bg-blue-300/30 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        
        <div className="flex items-center text-white mb-2">
          <span className="text-xl font-bold">{currency} {formatCurrency(amountNeeded)}</span>
        </div>
        
        <div className="mb-1.5">
          <Slider 
            value={[sliderValue]} 
            onValueChange={handleSliderChange}
            max={100} 
            min={0}
            step={1}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between text-xs text-white/60">
          <span>1000</span>
          <span>2500</span>
          <span>3000</span>
          <span>4000</span>
          <span>5000</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-2">
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
          onClick={handleSendClick}
        >
          <ArrowUp className="mr-2 h-5 w-5" />
          Send
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
          onClick={handleReceiveClick}
        >
          <ArrowDown className="mr-2 h-5 w-5" />
          Receive
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-3 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
          onClick={handleLoansClick}
        >
          <Building className="mr-2 h-5 w-5" />
          Loans
        </Button>
      </div>
    </div>
  );
};

export default BalanceSection;
