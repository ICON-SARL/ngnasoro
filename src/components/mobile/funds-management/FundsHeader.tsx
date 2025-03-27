
import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface FundsHeaderProps {
  onBack: () => void;
  onRefresh?: () => void;
}

const FundsHeader: React.FC<FundsHeaderProps> = ({ onBack, onRefresh }) => {
  return (
    <div className="bg-white pt-4 px-4 flex items-center justify-between">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onBack}
        className="h-10 w-10"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-xl font-semibold">Gestion des Fonds</h1>
      {onRefresh && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onRefresh}
          className="h-10 w-10"
        >
          <RefreshCw className="h-5 w-5" />
        </Button>
      )}
      {!onRefresh && <div className="w-10"></div>}
    </div>
  );
};

export default FundsHeader;
