
import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

interface SavingsHeaderProps {
  isBalanceHidden: boolean;
  toggleBalanceVisibility: () => void;
}

const SavingsHeader: React.FC<SavingsHeaderProps> = ({ 
  isBalanceHidden, 
  toggleBalanceVisibility 
}) => {
  return (
    <div className="bg-white p-4 shadow-sm flex justify-between items-center">
      <div>
        <h1 className="text-xl font-bold">Mes fonds</h1>
        <p className="text-gray-500 text-sm">Gérez votre épargne</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleBalanceVisibility}
      >
        {isBalanceHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </Button>
    </div>
  );
};

export default SavingsHeader;
