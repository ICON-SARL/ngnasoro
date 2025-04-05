
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Loader } from '@/components/ui/loader';

interface BalanceDisplayProps {
  isHidden: boolean;
  balance: number;
  currency: string;
  isUpdating: boolean;
  isPending: boolean;
  refreshBalance: () => void;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  isHidden,
  balance,
  currency,
  isUpdating,
  isPending,
  refreshBalance
}) => {
  return (
    <div className="bg-[#0D6A51]/5 rounded-xl p-4 flex flex-col items-center justify-center mt-2">
      <div className="flex items-center mb-1">
        <p className="text-sm text-[#0D6A51]">Solde disponible</p>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-6 w-6 ml-1 text-[#0D6A51]"
          onClick={refreshBalance}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader size="sm" variant="primary" className="text-[#0D6A51]" />
          ) : (
            <RefreshCw className="h-3 w-3" />
          )}
        </Button>
      </div>
      
      {isHidden ? (
        <p className="text-2xl font-bold text-gray-900">•••••• {currency}</p>
      ) : (
        <p className="text-2xl font-bold text-gray-900">
          {balance.toLocaleString('fr-FR')} {currency}
        </p>
      )}
      
      {isPending && (
        <p className="text-xs text-[#0D6A51] mt-1">Synchronisation en cours...</p>
      )}
    </div>
  );
};

export default BalanceDisplay;
