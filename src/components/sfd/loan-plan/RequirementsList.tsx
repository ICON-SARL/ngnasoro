
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Plus, X } from 'lucide-react';

interface RequirementsListProps {
  requirements: string[];
  newRequirement: string;
  onNewRequirementChange: (value: string) => void;
  onAddRequirement: () => void;
  onRemoveRequirement: (index: number) => void;
}

export function RequirementsList({
  requirements,
  newRequirement,
  onNewRequirementChange,
  onAddRequirement,
  onRemoveRequirement
}: RequirementsListProps) {
  return (
    <div className="space-y-2">
      <Label>Documents requis</Label>
      <div className="flex space-x-2">
        <Input
          value={newRequirement}
          onChange={(e) => onNewRequirementChange(e.target.value)}
          placeholder="Ajouter un document requis"
          className="flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onAddRequirement();
            }
          }}
        />
        <Button 
          type="button" 
          onClick={onAddRequirement}
          variant="outline"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      
      {requirements.length > 0 && (
        <ul className="mt-2 space-y-1">
          {requirements.map((req, index) => (
            <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
              <span>{req}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveRequirement(index)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
