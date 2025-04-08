
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface PrioritySelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function PrioritySelector({ value, onValueChange }: PrioritySelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="priority">Priorité *</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="priority">
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
