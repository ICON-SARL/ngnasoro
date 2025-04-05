
import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';

interface FundsHeaderProps {
  onBack: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

const FundsHeader: React.FC<FundsHeaderProps> = ({ 
  onBack, 
  onRefresh,
  isRefreshing = false
}) => {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <Button variant="ghost" size="icon" onClick={onBack}>
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-semibold">Gestion des Fonds</h1>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        disabled={isRefreshing}
      >
        {isRefreshing ? (
          <Loader size="sm" />
        ) : (
          <RefreshCw className="h-5 w-5" />
        )}
      </Button>
    </div>
  );
};

export default FundsHeader;
