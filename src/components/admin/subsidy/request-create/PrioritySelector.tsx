
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PriorityType } from './types';

interface PrioritySelectorProps {
  value: PriorityType;
  onValueChange: (value: PriorityType) => void;
}

export function PrioritySelector({ value, onValueChange }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority">Priorité</Label>
      <Select 
        value={value}
        onValueChange={(value) => onValueChange(value as PriorityType)}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une priorité" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="low">Basse</SelectItem>
          <SelectItem value="normal">Normale</SelectItem>
          <SelectItem value="high">Haute</SelectItem>
          <SelectItem value="urgent">Urgente</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
