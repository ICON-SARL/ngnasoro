
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoanRateFieldsProps {
  interestRate: string;
  fees: string;
  onInterestRateChange: (value: string) => void;
  onFeesChange: (value: string) => void;
}

export function LoanRateFields({
  interestRate,
  fees,
  onInterestRateChange,
  onFeesChange
}: LoanRateFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="interestRate">Taux d'intérêt (%) *</Label>
        <Input
          id="interestRate"
          type="number"
          value={interestRate}
          onChange={(e) => onInterestRateChange(e.target.value)}
          required
          min="0"
          step="0.1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fees">Frais administratifs (%) *</Label>
        <Input
          id="fees"
          type="number"
          value={fees}
          onChange={(e) => onFeesChange(e.target.value)}
          required
          min="0"
          step="0.1"
        />
      </div>
    </div>
  );
}
