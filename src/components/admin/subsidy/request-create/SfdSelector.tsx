
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SfdOption } from './types';

interface SfdSelectorProps {
  sfdId: string;
  availableSfds: SfdOption[];
  onValueChange: (value: string) => void;
}

export function SfdSelector({ sfdId, availableSfds, onValueChange }: SfdSelectorProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor="sfd_id">SFD Bénéficiaire</Label>
      <Select
        value={sfdId}
        onValueChange={onValueChange}
        required
      >
        <SelectTrigger>
          <SelectValue placeholder="Sélectionner un SFD" />
        </SelectTrigger>
        <SelectContent>
          {availableSfds.map((sfd) => (
            <SelectItem key={sfd.id} value={sfd.id}>
              {sfd.name} {sfd.region ? `(${sfd.region})` : ''}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
