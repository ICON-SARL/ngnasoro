
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface StepAmountProps {
  loanAmount: string;
  setLoanAmount: (amount: string) => void;
}

const StepAmount: React.FC<StepAmountProps> = ({ loanAmount, setLoanAmount }) => {
  return (
    <div className="space-y-4">
      <Label htmlFor="amount" className="text-lg font-medium">Montant du prêt</Label>
      <p className="text-sm text-gray-500 mb-3">Saisissez ou sélectionnez le montant dont vous avez besoin</p>
      
      <div className="bg-[#0D6A51]/5 p-4 rounded-xl mb-4">
        <Input
          id="amount"
          type="number"
          placeholder="50000"
          value={loanAmount}
          onChange={(e) => setLoanAmount(e.target.value)}
          className="text-2xl py-6 text-center font-bold border-0 bg-white shadow focus-visible:ring-[#0D6A51]"
        />
        <p className="text-xs text-center mt-2 text-gray-500">FCFA</p>
      </div>
      
      <Label className="text-sm">Montants suggérés</Label>
      <div className="grid grid-cols-2 gap-3">
        {[50000, 100000, 250000, 500000].map(amount => (
          <Button
            key={amount}
            variant="outline"
            onClick={() => setLoanAmount(amount.toString())}
            className={`flex-1 hover:border-[#0D6A51]/40 hover:bg-[#0D6A51]/5 ${
              parseInt(loanAmount) === amount ? 'border-[#0D6A51] bg-[#0D6A51]/10' : ''
            }`}
          >
            {amount.toLocaleString('fr-FR')}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default StepAmount;
