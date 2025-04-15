
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface LoanDurationFieldsProps {
  minDuration: string;
  maxDuration: string;
  onMinDurationChange: (value: string) => void;
  onMaxDurationChange: (value: string) => void;
}

export function LoanDurationFields({
  minDuration,
  maxDuration,
  onMinDurationChange,
  onMaxDurationChange
}: LoanDurationFieldsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor="minDuration">Durée minimum (mois) *</Label>
        <Input
          id="minDuration"
          type="number"
          value={minDuration}
          onChange={(e) => onMinDurationChange(e.target.value)}
          required
          min="1"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxDuration">Durée maximum (mois) *</Label>
        <Input
          id="maxDuration"
          type="number"
          value={maxDuration}
          onChange={(e) => onMaxDurationChange(e.target.value)}
          required
          min="1"
        />
      </div>
    </div>
  );
}
