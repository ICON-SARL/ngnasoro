
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import MobileHeader from '@/components/mobile/MobileHeader';
import BalanceSection from '@/components/mobile/BalanceSection';
import QuickAccessCard from '@/components/mobile/QuickAccessCard';
import FinancialOverview from '@/components/mobile/FinancialOverview';
import TransactionList from '@/components/mobile/TransactionList';
import PaymentTabContent from '@/components/mobile/PaymentTabContent';
import SecurePaymentTab from '@/components/mobile/SecurePaymentTab';
import ScheduleTransferTab from '@/components/mobile/ScheduleTransferTab';
import { useAuth } from '@/hooks/useAuth';
import { useAccount } from '@/hooks/useAccount';
import { useTransactions } from '@/hooks/useTransactions';

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('main');
  const navigate = useNavigate();
  
  const { user, loading } = useAuth();
  const { account, isLoading: accountLoading, updateBalance } = useAccount();
  const { transactions, isLoading: transactionsLoading, addTransaction } = useTransactions();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleAction = async (action: string) => {
    toast({
      title: `Action ${action}`,
      description: `Vous avez choisi de ${action.toLowerCase()}`,
    });
    
    // Switch to the corresponding tab when action is clicked
    if (action === 'Send' || action === 'Receive') {
      setActiveTab('payment');
    } else if (action === 'Float me cash') {
      setActiveTab('secure-payment');
    } else if (action === 'Schedule transfer') {
      setActiveTab('schedule-transfer');
    } else if (action.startsWith('Transfer to')) {
      setActiveTab('payment');
    }
  };

  // Handle payment submission
  const handlePaymentSubmit = async (data: { recipient: string, amount: number, note: string }) => {
    try {
      // Update balance (subtract amount)
      await updateBalance.mutateAsync({ amount: -data.amount });
      
      // Add transaction
      await addTransaction.mutateAsync({
        name: data.recipient,
        type: 'Envoi',
        amount: -data.amount,
        date: new Date().toISOString(),
        avatar_url: null
      });
      
      setActiveTab('main');
      
      toast({
        title: 'Paiement réussi',
        description: `Vous avez envoyé ${data.amount} FCFA à ${data.recipient}`,
      });
    } catch (error) {
      console.error('Payment error:', error);
    }
  };

  if (loading || accountLoading) {
    return <div className="p-8 text-center">Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="main" className="space-y-4 mt-0 p-0">
          {/* Header Section with Profile & Balance */}
          <div className="bg-black text-white p-4 rounded-b-3xl">
            <MobileHeader />
            <BalanceSection currency={account?.currency || 'FCFA'} balance={account?.balance || 0} />
          </div>
          
          {/* Quick Access Section */}
          <QuickAccessCard onAction={handleAction} />
          
          {/* Income & Expenses Section */}
          <FinancialOverview />
          
          {/* Transactions Section */}
          <TransactionList 
            transactions={transactions.map(tx => ({
              id: tx.id,
              name: tx.name,
              type: tx.type,
              amount: tx.amount.toString(),
              date: new Date(tx.date).toLocaleDateString(),
              avatar: tx.avatar_url
            }))}
            isLoading={transactionsLoading}
          />
        </TabsContent>
          
        <TabsContent value="payment" className="space-y-4 mt-0">
          <PaymentTabContent 
            onBack={() => setActiveTab('main')} 
            onSubmit={handlePaymentSubmit}
          />
        </TabsContent>

        <TabsContent value="secure-payment" className="space-y-4 mt-0">
          <SecurePaymentTab onBack={() => setActiveTab('main')} />
        </TabsContent>
        
        <TabsContent value="schedule-transfer" className="space-y-4 mt-0">
          <ScheduleTransferTab onBack={() => setActiveTab('main')} />
        </TabsContent>
      </Tabs>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
