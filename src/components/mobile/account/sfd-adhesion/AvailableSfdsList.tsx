
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { AvailableSfd } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';

interface AvailableSfdsListProps {
  sfds: AvailableSfd[];
  onSfdSelect: (sfd: AvailableSfd) => void;
  onViewMore: () => void;
  maxItems?: number;
}

const AvailableSfdsList: React.FC<AvailableSfdsListProps> = ({ 
  sfds, 
  onSfdSelect, 
  onViewMore, 
  maxItems = 2 
}) => {
  if (sfds.length === 0) {
    return null;
  }
  
  const displayedSfds = sfds.slice(0, maxItems);
  const hasMore = sfds.length > maxItems;
  
  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium text-sm">SFDs disponibles</h3>
        {hasMore && (
          <Button variant="ghost" size="sm" onClick={onViewMore} className="h-7 px-2 text-xs">
            Voir plus <ChevronRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
      
      <div className="space-y-2">
        {displayedSfds.map(sfd => (
          <div 
            key={sfd.id}
            className="p-3 bg-white border border-gray-200 rounded-md flex justify-between items-center cursor-pointer hover:bg-gray-50"
            onClick={() => onSfdSelect(sfd)}
          >
            <div>
              <p className="font-medium">{sfd.name}</p>
              <p className="text-xs text-gray-500">{sfd.region || sfd.code}</p>
            </div>
            <Button variant="outline" size="sm" className="h-7">
              Adhérer <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableSfdsList;
