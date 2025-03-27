
import React from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeLoanHeaderProps {
  onViewLoanProcess: () => void;
}

const HomeLoanHeader = ({ onViewLoanProcess }: HomeLoanHeaderProps) => {
  return (
    <div className="pt-2 pb-4">
      <div className="px-4 flex items-center justify-between mb-4">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/e8357419-009f-4b77-8913-c4e5bceddb72.png" 
            alt="InstantLoan Logo" 
            className="h-6 w-6 mr-2" 
          />
          <h1 className="text-lg font-bold text-white">InstantLoan</h1>
        </div>
        <Bell className="h-5 w-5 text-white" />
      </div>

      <div className="px-4">
        <h1 className="text-xl font-semibold text-white mb-1">Limite approuvée jusqu'à</h1>
        <h2 className="text-4xl font-bold text-white">5 000 FCFA</h2>
      </div>
    </div>
  );
};

export default HomeLoanHeader;
