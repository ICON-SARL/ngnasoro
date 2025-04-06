
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RegionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  regions: string[];
}

export function RegionSelector({ value, onValueChange, regions }: RegionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="region">Région ciblée</Label>
      <Select 
        value={value}
        onValueChange={onValueChange}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner une région (optionnel)" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Toutes les régions</SelectItem>
          {regions.map((region) => (
            <SelectItem key={region} value={region}>{region}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
