
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';

interface TabHeaderProps {
  onBack: () => void;
  isWithdrawal?: boolean;
}

const TabHeader: React.FC<TabHeaderProps> = ({ onBack, isWithdrawal = false }) => {
  return (
    <div className="bg-white border-b p-4 flex items-center gap-3">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
      >
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-[#0D6A51]" />
        <h1 className="text-xl font-semibold">
          {isWithdrawal ? "Retrait" : "Paiement"}
        </h1>
      </div>
    </div>
  );
};

export default TabHeader;
