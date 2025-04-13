
import React from 'react';
import { RefreshCw, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Loader } from '@/components/ui/loader';
import { formatCurrency } from '@/utils/format';

interface BalanceDisplayProps {
  isHidden: boolean;
  balance: number;
  currency: string;
  isUpdating: boolean;
  refreshBalance: () => void;
  isPending?: boolean;
  isVerified?: boolean;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  isHidden,
  balance,
  currency,
  isUpdating,
  refreshBalance,
  isPending = false,
  isVerified = true
}) => {
  const formattedBalance = formatCurrency(balance, currency);
  
  return (
    <div className="relative flex flex-col items-center justify-center my-4 pt-2 pb-4 px-4 bg-gray-50 rounded-xl">
      <div className="mb-2 text-gray-500 text-sm font-medium">
        Solde disponible
      </div>
      
      {isVerified ? (
        <div className="text-2xl font-bold mb-3">
          {isHidden ? '••••••' : formattedBalance}
        </div>
      ) : (
        <div className="flex flex-col items-center mb-3 text-center">
          <Lock className="h-5 w-5 mb-1 text-amber-500" />
          <div className="text-sm text-amber-600 font-medium">
            Compte en attente de validation
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Le solde sera disponible après validation par la SFD
          </div>
        </div>
      )}
      
      <Button
        onClick={refreshBalance}
        disabled={isUpdating || !isVerified}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 text-sm"
      >
        {isUpdating ? (
          <>
            <Loader size="sm" className="mr-1" />
            {isPending ? 'Synchronisation...' : 'Mise à jour...'}
          </>
        ) : (
          <>
            <RefreshCw className="h-3.5 w-3.5" />
            Actualiser
          </>
        )}
      </Button>
    </div>
  );
};

export default BalanceDisplay;
