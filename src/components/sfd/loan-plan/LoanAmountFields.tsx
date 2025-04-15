
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoanAmountFieldsProps {
  minAmount: string;
  maxAmount: string;
  onMinAmountChange: (value: string) => void;
  onMaxAmountChange: (value: string) => void;
}

export function LoanAmountFields({ 
  minAmount, 
  maxAmount, 
  onMinAmountChange, 
  onMaxAmountChange 
}: LoanAmountFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minAmount">Montant minimum (FCFA) *</Label>
        <Input
          id="minAmount"
          type="number"
          value={minAmount}
          onChange={(e) => onMinAmountChange(e.target.value)}
          required
          min="0"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxAmount">Montant maximum (FCFA) *</Label>
        <Input
          id="maxAmount"
          type="number"
          value={maxAmount}
          onChange={(e) => onMaxAmountChange(e.target.value)}
          required
          min="0"
        />
      </div>
    </div>
  );
}
