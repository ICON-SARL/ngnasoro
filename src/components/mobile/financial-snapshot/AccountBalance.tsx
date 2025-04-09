
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { Skeleton } from '@/components/ui/skeleton';
import { Wallet } from 'lucide-react';

const AccountBalance = () => {
  const { user } = useAuth();
  const { activeSfdAccount, isLoading } = useSfdAccounts();
  
  if (isLoading) {
    return (
      <div className="flex flex-col space-y-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-36" />
      </div>
    );
  }

  if (!activeSfdAccount) {
    return (
      <div className="flex flex-col">
        <p className="text-sm text-gray-500">Solde du compte</p>
        <div className="flex items-center mt-1">
          <p className="text-lg font-bold">0 FCFA</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <p className="text-sm text-gray-500">Solde du compte</p>
      <div className="flex items-center gap-2 mt-1">
        <Wallet className="h-5 w-5 text-[#0D6A51]" />
        <p className="text-lg font-bold">
          {activeSfdAccount.balance.toLocaleString('fr-FR')} {activeSfdAccount.currency}
        </p>
      </div>
    </div>
  );
};

export default AccountBalance;
