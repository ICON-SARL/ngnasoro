
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Building, Eye, EyeOff } from 'lucide-react';
import { SfdAccount } from '@/hooks/sfd/types';

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
      <h3 className="font-medium flex items-center">
        Aperçu compte épargne
        <Badge className="ml-2 bg-[#0D6A51]/10 text-[#0D6A51] text-xs border-0">
          <Building className="h-3 w-3 mr-1" />
          {sfdName || "SFD Nyèsigiso"}
        </Badge>
      </h3>
      <Button variant="ghost" size="icon" onClick={toggleVisibility} className="h-7 w-7">
        {isHidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};

export default SavingsHeader;
