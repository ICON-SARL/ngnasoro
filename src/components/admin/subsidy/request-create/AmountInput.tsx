
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface AmountInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AmountInput({ value, onChange }: AmountInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="amount">Montant (FCFA)</Label>
      <Input
        id="amount"
        name="amount"
        type="number"
        value={value}
        onChange={onChange}
        placeholder="ex: 5000000"
        required
      />
    </div>
  );
}
