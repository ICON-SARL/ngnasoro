
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import BalanceDisplay from '@/components/mobile/sfd-savings/BalanceDisplay';
import SavingsHeader from '@/components/mobile/savings/SavingsHeader';
import ActionButtons from '@/components/mobile/savings/ActionButtons';
import TransactionsSection from '@/components/mobile/savings/TransactionsSection';
import AccountDetailsSection from '@/components/mobile/savings/AccountDetailsSection';
import NoAccountState from '@/components/mobile/savings/NoAccountState';

const MobileSavingsPage: React.FC = () => {
  const { user } = useAuth();
  const { activeSfdAccount, isLoading: accountsLoading } = useSfdAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions(
    user?.id, 
    activeSfdAccount?.id // Using 'id' instead of 'sfd_id' to match the SfdAccount type
  );
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };
  
  const refreshBalance = () => {
    setIsRefreshing(true);
    // Simulate a balance refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };

  // Helper function to check if account is verified
  const canDisplayBalance = (account) => {
    return account && (account.isVerified || account.isDefault);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <SavingsHeader 
        isBalanceHidden={isBalanceHidden} 
        toggleBalanceVisibility={toggleBalanceVisibility} 
      />
      
      <div className="p-4">
        {accountsLoading ? (
          <Card>
            <div className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
            </div>
          </Card>
        ) : activeSfdAccount ? (
          <>
            <BalanceDisplay
              isHidden={isBalanceHidden}
              balance={activeSfdAccount.balance || 0}
              currency={activeSfdAccount.currency || 'FCFA'}
              isUpdating={isRefreshing}
              refreshBalance={refreshBalance}
              isPending={false}
              isVerified={canDisplayBalance(activeSfdAccount)}
            />
            
            <ActionButtons canDisplayBalance={canDisplayBalance(activeSfdAccount)} />
            
            <Tabs defaultValue="history" className="mt-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <TransactionsSection 
                  transactions={transactions} 
                  isLoading={transactionsLoading} 
                />
              </TabsContent>
              
              <TabsContent value="details">
                <AccountDetailsSection account={activeSfdAccount} />
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <NoAccountState />
        )}
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileSavingsPage;
