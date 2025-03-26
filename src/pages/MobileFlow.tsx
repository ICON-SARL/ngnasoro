
import React, { useState } from 'react';
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

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('main');
  const [currency, setCurrency] = useState('FCFA');

  const transactions = [
    {
      id: 1,
      name: 'Dribbble Premium',
      type: 'Subscription',
      amount: '-$60.00',
      date: '2 Oct 2023',
      avatar: null
    },
    {
      id: 2,
      name: 'Mamadou Keita',
      type: 'Reçu',
      amount: '+25,000',
      date: '18 Déc',
      avatar: '/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png'
    },
    {
      id: 3,
      name: 'Orange Money',
      type: 'Abonnement',
      amount: '-1,200',
      date: '15 Déc',
      avatar: null
    },
    {
      id: 4,
      name: 'Aminata Diallo',
      type: 'Reçu',
      amount: '+15,000',
      date: '12 Déc',
      avatar: null
    },
  ];

  const handleAction = (action: string) => {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="main" className="space-y-4 mt-0 p-0">
          {/* Header Section with Profile & Balance */}
          <div className="bg-black text-white p-4 rounded-b-3xl">
            <MobileHeader />
            <BalanceSection currency={currency} />
          </div>
          
          {/* Quick Access Section */}
          <QuickAccessCard onAction={handleAction} />
          
          {/* Income & Expenses Section */}
          <FinancialOverview />
          
          {/* Transactions Section */}
          <TransactionList transactions={transactions} />
        </TabsContent>
          
        <TabsContent value="payment" className="space-y-4 mt-0">
          <PaymentTabContent onBack={() => setActiveTab('main')} />
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
