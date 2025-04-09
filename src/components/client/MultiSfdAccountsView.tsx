
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { Skeleton } from '@/components/ui/skeleton';
import { SfdLoan, SfdAccount } from '@/hooks/sfd/types';
import { 
  SfdAccountCard,
  SfdAccountDetails,
  EmptySfdState,
  DiscoverSfdDialog
} from './sfd-accounts';

export interface SfdAccountType {
  id: string;
  name: string;
  logoUrl?: string;
  logo_url?: string;
  region?: string;
  code?: string;
  isDefault: boolean;
  balance: number;
  currency: string;
  isVerified: boolean;
  loans?: SfdLoan[];
}

const adaptSfdAccount = (account: any): SfdAccountType => {
  return {
    id: account.id,
    name: account.name,
    logoUrl: account.logoUrl,
    logo_url: account.logo_url,
    region: account.region || 'Non spécifié',
    code: account.code || '',
    isDefault: account.isDefault || false,
    balance: account.balance || 0,
    currency: account.currency || 'FCFA',
    isVerified: account.isVerified || false,
    loans: account.loans || []
  };
};

export function MultiSfdAccountsView() {
  const { user } = useAuth();
  const { sfdAccounts, activeSfdAccount, isLoading, makeLoanPayment } = useSfdAccounts();
  const [discoverSfdOpen, setDiscoverSfdOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!sfdAccounts || sfdAccounts.length === 0) {
    return <EmptySfdState />;
  }

  const adaptedSfdAccounts = sfdAccounts.map(adaptSfdAccount);
  const adaptedActiveSfdAccount = activeSfdAccount ? adaptSfdAccount(activeSfdAccount) : null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Mes Comptes SFD</h2>
        <Button 
          variant="outline" 
          onClick={() => setDiscoverSfdOpen(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Ajouter un compte
        </Button>
        
        <DiscoverSfdDialog 
          open={discoverSfdOpen} 
          onOpenChange={setDiscoverSfdOpen} 
        />
      </div>

      <div className="flex overflow-x-auto pb-4 space-x-4">
        {adaptedSfdAccounts.map((account: SfdAccountType) => (
          <SfdAccountCard key={account.id} account={account} />
        ))}
      </div>
      
      {adaptedActiveSfdAccount && (
        <SfdAccountDetails 
          account={adaptedActiveSfdAccount}
          makeLoanPayment={makeLoanPayment}
        />
      )}
    </div>
  );
}

export default MultiSfdAccountsView;
