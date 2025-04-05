
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SavingsHeaderProps {
  sfdName: string;
  isHidden: boolean;
  toggleVisibility: () => void;
}

const SavingsHeader: React.FC<SavingsHeaderProps> = ({ 
  sfdName, 
  isHidden,
  toggleVisibility 
}) => {
  return (
    <div className="flex justify-between items-center mb-2">
      <div>
        <h3 className="font-semibold text-lg text-gray-900">{sfdName}</h3>
        <p className="text-sm text-gray-500">Votre compte principal</p>
      </div>
      <Button 
        variant="ghost" 
        size="sm" 
        className="p-1"
        onClick={toggleVisibility}
      >
        {isHidden ? (
          <Eye className="h-5 w-5 text-gray-600" />
        ) : (
          <EyeOff className="h-5 w-5 text-gray-600" />
        )}
      </Button>
    </div>
  );
};

export default SavingsHeader;
