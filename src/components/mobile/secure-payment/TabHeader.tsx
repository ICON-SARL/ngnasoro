
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface TabHeaderProps {
  onBack: () => void;
  isWithdrawal?: boolean;
}

const TabHeader: React.FC<TabHeaderProps> = ({ onBack, isWithdrawal = false }) => {
  return (
    <div className="p-4 flex items-center justify-between border-b">
      <Button variant="ghost" onClick={onBack} className="p-1">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-lg font-bold">
        {isWithdrawal ? "Retrait de fonds" : "Remboursement de prêt"}
      </h1>
      <div className="w-5"></div>
    </div>
  );
};

export default TabHeader;
