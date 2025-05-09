
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import FundsBalanceSection from './FundsBalanceSection';
import TransactionList from './TransactionList';
import FundsActionButtons from './FundsActionButtons';
import { useTransactions } from '@/hooks/useTransactions';
import { SfdAccountDisplay } from '@/components/mobile/profile/sfd-accounts/types/SfdAccountTypes';
import { normalizeSfdAccounts } from '@/utils/accountAdapters';

const FundsManagementPage: React.FC = () => {
  const { activeSfdId, user } = useAuth();
  const { sfdAccounts, isLoading: accountsLoading, synchronizeBalances, refetch } = useSfdAccounts();
  const [selectedSfd, setSelectedSfd] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const { transactions, isLoading: transactionsLoading, refetch: refetchTransactions } = useTransactions();
  
  // Use normalized accounts to ensure consistent property access
  const normalizedAccounts = normalizeSfdAccounts(sfdAccounts);
  
  // Calculate total balance across accounts
  const totalBalance = normalizedAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  
  // Filter and prepare display accounts
  const displayAccounts: SfdAccountDisplay[] = normalizedAccounts.map(account => ({
    id: account.id,
    name: account.name || account.description || `Compte ${account.account_type || ''}`,
    balance: account.balance || 0,
    logo_url: account.logo_url || null,
    currency: account.currency || 'FCFA',
    isVerified: true,
    isActive: account.id === activeSfdId,
    is_default: account.isDefault || account.is_default || false
  }));
  
  // Handle refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([
        refetch(), 
        synchronizeBalances.mutateAsync(), 
        refetchTransactions()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };
  
  return (
    <div className="p-4 pb-20">
      <h1 className="text-2xl font-bold mb-4">Gestion des fonds</h1>
      
      <div className="space-y-4">
        <FundsBalanceSection 
          balance={totalBalance}
          isRefreshing={accountsLoading || synchronizeBalances.isPending}
          sfdAccounts={displayAccounts}
          onSelectSfd={setSelectedSfd}
          selectedSfd={selectedSfd}
          onRefresh={handleRefresh}
        />
        
        <FundsActionButtons />
        
        <TransactionList 
          isLoading={transactionsLoading} 
          transactions={transactions}
          filterType={filterType}
          setFilterType={setFilterType}
          filterPeriod={filterPeriod}
          setFilterPeriod={setFilterPeriod}
        />
      </div>
    </div>
  );
};

export default FundsManagementPage;
