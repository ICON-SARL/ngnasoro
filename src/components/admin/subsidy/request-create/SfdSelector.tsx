
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface SfdSelectorProps {
  sfdId: string;
  availableSfds: { id: string; name: string; region: string }[];
  onValueChange: (value: string) => void;
}

export function SfdSelector({ sfdId, availableSfds, onValueChange }: SfdSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sfd">SFD *</Label>
      <Select value={sfdId} onValueChange={onValueChange}>
        <SelectTrigger id="sfd">
          <SelectValue placeholder="Sélectionner un SFD" />
        </SelectTrigger>
        <SelectContent>
          {availableSfds.map((sfd) => (
            <SelectItem key={sfd.id} value={sfd.id}>
              {sfd.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
