
import React from 'react';
import { BiRefresh } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useCompatSfdAccounts } from '@/hooks/useCompatSfdAccounts';
import { useAuth } from '@/hooks/useAuth';
import { ArrowUpRight } from 'lucide-react';

const AccountBalance = () => {
  const { activeSfdAccount, isLoading, synchronizeBalances } = useCompatSfdAccounts();
  const { activeSfdId } = useAuth();

  // Function to format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '0 FCFA';
    return new Intl.NumberFormat('fr-FR').format(amount) + ' ' + 
           (activeSfdAccount?.currency || 'FCFA');
  };

  const handleRefresh = () => {
    if (synchronizeBalances) {
      synchronizeBalances.mutate?.();
    }
  };

  // Create a refresh button component
  const RefreshButton = () => (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleRefresh}
      className="p-1 h-auto hover:bg-transparent text-gray-500 hover:text-gray-700"
      disabled={synchronizeBalances?.isPending}
    >
      <BiRefresh 
        className={`h-5 w-5 ${synchronizeBalances?.isPending ? 'animate-spin' : ''}`} 
      />
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 flex items-center">
          Solde disponible
          <RefreshButton />
        </h3>
        <Skeleton className="h-7 w-32" />
      </div>
    );
  }

  if (!activeSfdAccount || activeSfdId === null) {
    return (
      <div className="space-y-2">
        <h3 className="text-sm text-gray-500 flex items-center">
          Solde disponible
          <RefreshButton />
        </h3>
        <p className="text-lg font-bold text-gray-400">Non connecté</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm text-gray-500 flex items-center justify-between">
        <span>Solde disponible</span>
        <RefreshButton />
      </h3>
      <div className="flex items-center gap-2">
        <p className={`text-2xl font-bold ${synchronizeBalances?.isPending ? 'text-gray-400' : 'text-[#0D6A51]'}`}>
          {formatCurrency(activeSfdAccount.balance)}
        </p>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-6 px-2 rounded-full bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800"
          disabled={synchronizeBalances?.isPending}
        >
          <ArrowUpRight className="h-3 w-3 mr-1" />
          <span className="text-xs">Recharger</span>
        </Button>
      </div>
    </div>
  );
};

export default AccountBalance;
