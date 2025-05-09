
import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { SfdAccountDisplay } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

export interface FundsBalanceSectionProps {
  balance: number;
  isRefreshing: boolean;
  onRefresh?: () => Promise<void>; // Added optional onRefresh prop
  sfdAccounts: SfdAccountDisplay[];
  onSelectSfd: React.Dispatch<React.SetStateAction<string>>;
  selectedSfd: string;
}

const FundsBalanceSection: React.FC<FundsBalanceSectionProps> = ({
  balance,
  isRefreshing,
  sfdAccounts,
  onSelectSfd,
  selectedSfd,
  onRefresh
}) => {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-medium">Solde disponible</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      <div className="text-3xl font-bold mb-4">
        {formatCurrencyAmount(balance)} FCFA
      </div>
      
      {sfdAccounts.length > 1 && (
        <div className="flex flex-wrap gap-2 mt-3">
          <Button
            variant={selectedSfd === 'all' ? 'default' : 'outline'}
            size="sm"
            className="text-xs"
            onClick={() => onSelectSfd('all')}
          >
            Tous les comptes
          </Button>
          
          {sfdAccounts.map(account => (
            <Button
              key={account.id}
              variant={selectedSfd === account.id ? 'default' : 'outline'}
              size="sm"
              className="text-xs"
              onClick={() => onSelectSfd(account.id)}
            >
              {account.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FundsBalanceSection;
