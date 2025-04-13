
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import SfdItem from './SfdItem';

interface Sfd {
  id: string;
  name: string;
  region?: string;
  code?: string;
  logo_url?: string;
}

interface SfdListProps {
  sfds: Sfd[];
  selectedSfdId: string | null;
  onSelect: (sfdId: string) => void;
}

const SfdList: React.FC<SfdListProps> = ({ sfds, selectedSfdId, onSelect }) => {
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">SFDs disponibles</h3>
      <div className="grid gap-3">
        {sfds.map(sfd => (
          <SfdItem
            key={sfd.id}
            sfd={sfd}
            isSelected={selectedSfdId === sfd.id}
            onSelect={() => onSelect(sfd.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default SfdList;
