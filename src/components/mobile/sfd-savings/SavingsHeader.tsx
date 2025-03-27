
import React from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface SavingsHeaderProps {
  sfdName: string;
  isHidden: boolean;
  toggleVisibility: () => void;
}

const SavingsHeader: React.FC<SavingsHeaderProps> = ({ 
  sfdName = "Premier SFD", 
  isHidden, 
  toggleVisibility 
}) => {
  return (
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Aperçu compte épargne</h3>
      <div className="flex items-center gap-2">
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
          {sfdName}
        </span>
        <button 
          onClick={toggleVisibility} 
          className="text-gray-600 hover:text-gray-800"
        >
          {isHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
};

export default SavingsHeader;
