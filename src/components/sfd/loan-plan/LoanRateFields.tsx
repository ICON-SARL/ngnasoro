
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MAX_INTEREST_RATE } from './constants';

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
          max={MAX_INTEREST_RATE}
          step="0.1"
        />
        {parseFloat(interestRate) > MAX_INTEREST_RATE && (
          <p className="text-xs text-red-500">
            Le taux ne peut pas dépasser {MAX_INTEREST_RATE}% selon les régulations.
          </p>
        )}
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
