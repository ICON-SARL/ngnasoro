
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface SavingsHeaderProps {
  sfdName: string | undefined;
  isHidden: boolean;
  toggleVisibility: () => void;
}

const SavingsHeader: React.FC<SavingsHeaderProps> = ({ 
  sfdName, 
  isHidden, 
  toggleVisibility 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="font-medium">Aperçu compte épargne</h3>
      <div className="flex items-center gap-2">
        <Badge className="bg-[#E7F6F0] text-[#0D6A51] text-xs border-0 px-2">
          {sfdName || "Premier SFD"}
        </Badge>
        <Button variant="ghost" size="icon" onClick={toggleVisibility} className="h-7 w-7">
          {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default SavingsHeader;
