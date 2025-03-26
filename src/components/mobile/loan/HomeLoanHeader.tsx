
import React from 'react';
import { Bell, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HomeLoanHeaderProps {
  onViewLoanProcess: () => void;
}

const HomeLoanHeader = ({ onViewLoanProcess }: HomeLoanHeaderProps) => {
  return (
    <div>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center">
          <div className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/e8357419-009f-4b77-8913-c4e5bceddb72.png" 
              alt="InstantLoan Logo" 
              className="h-8 w-8" 
            />
            <h1 className="text-xl font-bold text-white">InstantLoan</h1>
          </div>
        </div>
        <Bell className="h-6 w-6 text-white" />
      </div>

      <div className="px-4 pb-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Limite approuvée jusqu'à</h1>
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center text-xs bg-blue-500 text-white border-blue-500 hover:bg-blue-600 hover:text-white"
            onClick={onViewLoanProcess}
          >
            <Plus className="h-3 w-3 mr-1" /> Processus
          </Button>
        </div>
        <h2 className="text-5xl font-bold text-white mb-4">5 000 FCFA</h2>
      </div>
    </div>
  );
};

export default HomeLoanHeader;
