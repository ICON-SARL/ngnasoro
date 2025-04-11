
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
    <div className="flex justify-between items-center p-5 border-b bg-white">
      <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-gray-100 rounded-full">
        <ArrowLeft className="h-5 w-5" />
      </Button>
      <h1 className="text-xl font-semibold text-gray-800">Gestion des Fonds</h1>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={onRefresh}
        disabled={isRefreshing}
        className="hover:bg-gray-100 rounded-full"
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
