
import React from 'react';
import { ChevronLeft } from 'lucide-react';
import { useLocalization } from '@/contexts/LocalizationContext';
import { Button } from '@/components/ui/button';

interface TabHeaderProps {
  onBack: () => void;
  isWithdrawal?: boolean;
}

const TabHeader: React.FC<TabHeaderProps> = ({ onBack, isWithdrawal = false }) => {
  const { t } = useLocalization();
  
  return (
    <div className="bg-white p-4 shadow-sm flex items-center">
      <Button 
        variant="ghost" 
        size="sm"
        className="p-1 mr-2" 
        onClick={onBack}
      >
        <ChevronLeft className="h-5 w-5" />
      </Button>
      <h1 className="font-semibold text-lg">
        {isWithdrawal 
          ? "Retrait Mobile Money" 
          : "Paiement sécurisé"
        }
      </h1>
    </div>
  );
};

export default TabHeader;
