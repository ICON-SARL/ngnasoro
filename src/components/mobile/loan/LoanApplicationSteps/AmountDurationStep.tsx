
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

interface AmountDurationStepProps {
  amount: number;
  setAmount: (amount: number) => void;
  durationMonths: number;
  setDurationMonths: (duration: number) => void;
  onNext: () => void;
  isValid: boolean;
}

const AmountDurationStep: React.FC<AmountDurationStepProps> = ({
  amount,
  setAmount,
  durationMonths,
  setDurationMonths,
  onNext,
  isValid
}) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setAmount(parseInt(value) || 0);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-center mb-4">Montant et Durée du Prêt</h2>
      
      <div className="space-y-2">
        <Label htmlFor="loan-amount">Montant du prêt (FCFA)</Label>
        <Input
          id="loan-amount"
          type="text"
          value={amount || ''}
          onChange={handleAmountChange}
          className="text-lg"
          placeholder="Ex: 100000"
        />
        <p className="text-xs text-muted-foreground">Montant minimum: 50,000 FCFA</p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="loan-duration">Durée du prêt</Label>
        <Select 
          value={durationMonths.toString()} 
          onValueChange={(value) => setDurationMonths(parseInt(value))}
        >
          <SelectTrigger id="loan-duration">
            <SelectValue placeholder="Sélectionnez une durée" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="3">3 mois</SelectItem>
            <SelectItem value="6">6 mois</SelectItem>
            <SelectItem value="9">9 mois</SelectItem>
            <SelectItem value="12">12 mois</SelectItem>
            <SelectItem value="18">18 mois</SelectItem>
            <SelectItem value="24">24 mois</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Button 
        className="w-full mt-4" 
        onClick={onNext} 
        disabled={!isValid}
      >
        Continuer <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default AmountDurationStep;
