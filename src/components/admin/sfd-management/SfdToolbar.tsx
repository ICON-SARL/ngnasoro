
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface SfdToolbarProps {
  sfdCount: number;
  onAddSfd: () => void;
}

export function SfdToolbar({ sfdCount, onAddSfd }: SfdToolbarProps) {
  return (
    <div className="flex justify-between items-start mb-4">
      <h2 className="text-xl font-semibold">
        Liste des SFDs ({sfdCount})
      </h2>
      
      <Button onClick={onAddSfd} className="flex items-center">
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une SFD
      </Button>
    </div>
  );
}
