
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Info } from 'lucide-react';

interface StepDurationProps {
  loanAmount: string;
  loanDuration: string;
  setLoanDuration: (duration: string) => void;
}

const StepDuration: React.FC<StepDurationProps> = ({ loanAmount, loanDuration, setLoanDuration }) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="duration" className="text-lg font-medium">Durée du prêt</Label>
      <p className="text-sm text-gray-500 mb-3">Sélectionnez la durée de remboursement qui vous convient</p>
      
      <div className="grid grid-cols-3 gap-3">
        {[3, 6, 12, 18, 24, 36].map(months => (
          <Button
            key={months}
            variant={loanDuration === months.toString() ? "default" : "outline"}
            className={`h-auto py-4 transition-all ${
              loanDuration === months.toString() 
                ? 'bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-md scale-105' 
                : 'hover:border-[#0D6A51]/40 hover:bg-[#0D6A51]/5'
            }`}
            onClick={() => setLoanDuration(months.toString())}
          >
            <div className="flex flex-col">
              <span className="text-lg font-bold">{months}</span>
              <span className="text-xs">mois</span>
            </div>
          </Button>
        ))}
      </div>
      
      <div className="mt-4 bg-blue-50 p-3 rounded-xl">
        <div className="flex items-center">
          <Info className="h-5 w-5 text-blue-500 mr-2" />
          <p className="text-sm text-blue-600">
            Mensualité estimée: {(parseInt(loanAmount || '0') / parseInt(loanDuration || '1') * 1.055).toFixed(0)} FCFA
          </p>
        </div>
      </div>
    </div>
  );
};

export default StepDuration;
