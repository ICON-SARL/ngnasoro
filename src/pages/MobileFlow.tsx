
import React, { useState } from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

import UserHeader from '@/components/mobile/UserHeader';
import AccountBalance from '@/components/mobile/AccountBalance';
import TransactionsList from '@/components/mobile/TransactionsList';
import GoalsSection from '@/components/mobile/GoalsSection';
import MobilePaymentOptions from '@/components/mobile/MobilePaymentOptions';

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [month, setMonth] = useState('Décembre');
  const [activeTab, setActiveTab] = useState('main');

  const transactions = [
    {
      id: 1,
      name: 'Mamadou Keita',
      type: 'Reçu',
      amount: '+25,000',
      date: '18 Déc',
      avatar: '/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png'
    },
    {
      id: 2,
      name: 'Orange Money',
      type: 'Abonnement',
      amount: '-1,200',
      date: '15 Déc',
      avatar: null
    },
    {
      id: 3,
      name: 'Aminata Diallo',
      type: 'Reçu',
      amount: '+15,000',
      date: '12 Déc',
      avatar: null
    },
    {
      id: 4,
      name: 'Shopping Supermarché',
      type: 'Shopping',
      amount: '-8,500',
      date: '10 Déc',
      avatar: null
    },
  ];

  const handleAction = (action: string) => {
    toast({
      title: `Action ${action}`,
      description: `Vous avez choisi de ${action.toLowerCase()}`,
    });
    
    if (action === 'Déposer' || action === 'Retirer' || action === 'Transférer') {
      setActiveTab('payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto pt-4 px-4 pb-20">
        <UserHeader />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="main" className="space-y-4 mt-0">
            <AccountBalance onActionClick={handleAction} />
            <TransactionsList transactions={transactions} month={month} />
            <GoalsSection />
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4 mt-0">
            <MobilePaymentOptions onBackClick={() => setActiveTab('main')} />
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
