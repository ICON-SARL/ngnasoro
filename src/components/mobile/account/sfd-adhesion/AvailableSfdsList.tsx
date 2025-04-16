
import React from 'react';
import { Button } from '@/components/ui/button';
import { Building, Plus } from 'lucide-react';
import { AvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

interface AvailableSfdsListProps {
  sfds: AvailableSfd[];
  onSfdSelect: (sfd: AvailableSfd) => void;
  onViewMore: () => void;
}

const AvailableSfdsList: React.FC<AvailableSfdsListProps> = ({ 
  sfds,
  onSfdSelect,
  onViewMore
}) => {
  if (!sfds.length) return null;

  return (
    <div className="mt-4">
      <p className="text-sm font-medium mb-2">SFDs disponibles</p>
      <div className="grid grid-cols-2 gap-2">
        {sfds.slice(0, 4).map(sfd => (
          <Button 
            key={sfd.id}
            variant="outline" 
            className="flex flex-col h-auto items-center justify-center p-3 text-center"
            onClick={(e) => {
              e.stopPropagation();
              onSfdSelect(sfd);
            }}
          >
            <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center mb-1">
              <Building className="h-4 w-4 text-blue-600" />
            </div>
            <span className="text-xs font-medium">{sfd.name}</span>
          </Button>
        ))}
        {sfds.length > 4 && (
          <Button 
            variant="outline" 
            className="flex flex-col h-auto items-center justify-center p-3"
            onClick={(e) => {
              e.stopPropagation();
              onViewMore();
            }}
          >
            <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center mb-1">
              <Plus className="h-4 w-4 text-gray-600" />
            </div>
            <span className="text-xs font-medium">Voir plus</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AvailableSfdsList;
