
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface BalanceDisplayProps {
  isHidden: boolean;
  balance: number | undefined;
  currency: string | undefined;
  isUpdating: boolean;
  refreshBalance: () => void;
  isPending: boolean;
}

const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  isHidden,
  balance = 0,
  currency = 'FCFA',
  isUpdating,
  refreshBalance,
  isPending
}) => {
  return (
    <div className="border-t border-gray-100 pt-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">Solde total épargne</p>
          <p className="text-lg font-semibold">
            {isHidden ? '••••••••' : `${balance.toLocaleString()} ${currency}`}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          onClick={refreshBalance}
          disabled={isUpdating || isPending}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isUpdating || isPending ? 'animate-spin' : ''}`} />
          {isUpdating || isPending ? 'Actualisation...' : 'Actualiser'}
        </Button>
      </div>
    </div>
  );
};

export default BalanceDisplay;
