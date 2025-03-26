
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Building, Bell, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
  const nextPaymentDate = "15/07/2023";
  const nextPaymentAmount = 25000;
  
  const handleSliderChange = (value: number[]) => {
    const newValue = value[0];
    setSliderValue(newValue);
    
    // Calculate amount based on slider percentage
    const calculatedAmount = Math.round((newValue / 100) * maxApprovedLimit);
    setAmountNeeded(calculatedAmount);
  };
  
  const handleRepaymentClick = () => {
    if (onAction) {
      onAction('Repayment', { amount: nextPaymentAmount });
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
    return amount.toLocaleString();
  };

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-white/80 uppercase tracking-wide mb-1">
            LIMITE DE PRÊT APPROUVÉE <span>↗</span>
          </p>
          <h1 className="text-4xl font-bold text-white mb-2">
            {currency} {formatCurrency(maxApprovedLimit)}
          </h1>
          <Badge className="bg-[#FFAB2E]/90 text-white border-none">
            Nouveau prêt disponible
          </Badge>
        </div>
        <div className="bg-white/20 rounded-full px-3 py-1.5 flex items-center">
          <Building className="h-4 w-4 mr-1.5 text-white" />
          <span className="text-sm text-white">SFD Primaire</span>
        </div>
      </div>
      
      <Card className="p-3 bg-white/10 backdrop-blur-sm rounded-xl mt-4 mb-4 border-none">
        <CardContent className="p-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-white" />
              <p className="text-white text-sm">Prochain remboursement</p>
            </div>
            <Badge className="bg-red-500/80 text-white border-none">
              {nextPaymentDate}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-white text-sm">Montant dû:</p>
            <p className="text-white font-bold">{currency} {formatCurrency(nextPaymentAmount)}</p>
          </div>
        </CardContent>
      </Card>
      
      <div className="p-4 bg-white/10 backdrop-blur-sm rounded-xl mb-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-white text-base">Montant souhaité</p>
          <div className="h-6 w-6 bg-blue-400/50 rounded-full flex items-center justify-center">
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-white mb-3">
          {currency} {formatCurrency(amountNeeded)}
        </h2>
        
        <div className="mb-3">
          <Slider 
            value={[sliderValue]} 
            onValueChange={handleSliderChange}
            max={100} 
            min={0}
            step={1}
            className="w-full"
          />
        </div>
        
        <div className="flex justify-between text-xs text-white">
          <span>1000</span>
          <span>2500</span>
          <span>3000</span>
          <span>4000</span>
          <span>5000</span>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-5 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
          onClick={handleRepaymentClick}
        >
          <ArrowUp className="mr-2 h-5 w-5" />
          Rembourser
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-5 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
          onClick={handleReceiveClick}
        >
          <ArrowDown className="mr-2 h-5 w-5" />
          Créditer
        </Button>
        <Button 
          variant="outline" 
          className="flex items-center justify-center py-5 bg-white/20 hover:bg-white/30 text-white border-none backdrop-blur-sm"
          onClick={handleLoansClick}
        >
          <Building className="mr-2 h-5 w-5" />
          Prêts
        </Button>
      </div>
    </div>
  );
};

export default BalanceSection;
