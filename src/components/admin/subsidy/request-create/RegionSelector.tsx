
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface RegionSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  regions: { id: string; name: string }[];
}

export function RegionSelector({ value, onValueChange, regions }: RegionSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="region">Région</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id="region">
          <SelectValue placeholder="Sélectionner une région" />
        </SelectTrigger>
        <SelectContent>
          {regions.map((region) => (
            <SelectItem key={region.id} value={region.id}>
              {region.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
