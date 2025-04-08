
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface AmountInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Montant (FCFA) *</Label>
      <Input
        id="amount"
        name="amount"
        type="number"
        placeholder="Entrer le montant"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}
