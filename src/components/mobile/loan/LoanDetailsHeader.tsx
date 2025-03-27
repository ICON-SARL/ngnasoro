
import React from 'react';
import { ArrowLeft, ActivitySquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface LoanDetailsHeaderProps {
  onBack: () => void;
  onViewProcess: () => void;
}

const LoanDetailsHeader: React.FC<LoanDetailsHeaderProps> = ({
  onBack,
  onViewProcess
}) => {
  return (
    <>
      <div className="p-4 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="p-1">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-bold">Détails du prêt</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="flex items-center text-xs" 
          onClick={onViewProcess}
        >
          <ActivitySquare className="h-3 w-3 mr-1" /> Processus
        </Button>
      </div>

      <div className="p-4">
        <h1 className="text-2xl font-bold">Microfinance Bamako</h1>
      </div>
    </>
  );
};

export default LoanDetailsHeader;
