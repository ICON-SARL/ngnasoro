
import React from 'react';
import { Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SfdSelectorEmptyProps {
  className?: string;
}

const SfdSelectorEmpty: React.FC<SfdSelectorEmptyProps> = ({ className }) => {
  return (
    <div className={className}>
      <div className="bg-white text-amber-700 border-2 border-amber-300 px-3 py-2 h-10 rounded-lg w-full flex items-center justify-between">
        <div className="flex items-center">
          <Info className="h-4 w-4 mr-2 text-amber-500" />
          <span>Aucune SFD disponible</span>
        </div>
        <Badge variant="outline" className="bg-amber-100 text-amber-800 text-xs">
          Adhésion requise
        </Badge>
      </div>
    </div>
  );
};

export default SfdSelectorEmpty;
