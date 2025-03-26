
import React from 'react';
import { Slider } from '@/components/ui/slider';

interface LoanAmountSelectorProps {
  loanAmount: number;
  onLoanAmountChange: (value: number[]) => void;
  formatCurrency: (amount: number) => string;
}

const LoanAmountSelector = ({ 
  loanAmount, 
  onLoanAmountChange, 
  formatCurrency 
}: LoanAmountSelectorProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <p className="text-sm text-gray-600">I want money</p>
        <div className="flex items-center">
          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center mr-2">
            <div className="h-3 w-3 bg-blue-400 rounded-full"></div>
          </div>
        </div>
      </div>
      <h3 className="text-4xl font-bold mb-4">{formatCurrency(loanAmount)}</h3>
      
      <div className="mb-4">
        <Slider 
          defaultValue={[loanAmount]} 
          max={5000} 
          min={1000} 
          step={250}
          onValueChange={onLoanAmountChange}
          className="w-full"
        />
      </div>
      
      <div className="flex justify-between text-xs text-gray-500 mb-4">
        <span>1000</span>
        <span>2500</span>
        <span>3000</span>
        <span>4000</span>
        <span>5000</span>
      </div>
    </div>
  );
};

export default LoanAmountSelector;
