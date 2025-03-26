
import React from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface LoanTermSelectorProps {
  termMonths: number;
}

const LoanTermSelector = ({ termMonths }: LoanTermSelectorProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <p className="text-sm text-gray-600">For term:</p>
        <div className="flex items-center">
          <h4 className="text-xl font-bold">{termMonths} months</h4>
          <div className="ml-3 bg-green-100 p-1 rounded-full flex items-center justify-center">
            <div className="h-4 w-4 bg-green-400 rounded-full flex items-center justify-center">
              <CheckCircle className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </div>
      <Button 
        variant="ghost" 
        className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0"
      >
        VIEW DETAILS
      </Button>
    </div>
  );
};

export default LoanTermSelector;
