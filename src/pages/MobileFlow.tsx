
import React, { useState } from 'react';
import MobileNavigation from '@/components/MobileNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ArrowDownCircle, 
  ArrowUpCircle, 
  ArrowRightCircle,
  Home as HomeIcon,
  CreditCard,
  Settings,
  Bitcoin,
  CircleDollarSign,
  Plus,
  Phone as Smartphone // Added Phone icon as a replacement for Smartphone
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

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
    
    // Switch to the corresponding tab when action is clicked
    if (action === 'Déposer' || action === 'Retirer' || action === 'Transférer') {
      setActiveTab('payment');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto pt-4 px-4 pb-20">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-[#0D6A51]">
              <img src="/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png" alt="User" />
            </Avatar>
            <div>
              <p className="text-sm text-gray-600">Bonjour, Amadou</p>
              <p className="text-xs text-gray-500">Bienvenue</p>
            </div>
          </div>
          <div className="flex items-center">
            <CreditCard className="h-6 w-6 text-[#0D6A51]" />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsContent value="main" className="space-y-4 mt-0">
            {/* Main balance card */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-5">
                <p className="text-sm text-gray-600 mb-1">Solde total</p>
                <h1 className="text-3xl font-bold mb-5">155 804 FCFA</h1>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <Button 
                    onClick={() => handleAction('Déposer')} 
                    className="flex flex-col items-center h-auto py-3 bg-green-100 hover:bg-green-200 text-[#0D6A51] rounded-xl"
                  >
                    <ArrowDownCircle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Déposer</span>
                  </Button>
                  
                  <Button 
                    onClick={() => handleAction('Retirer')} 
                    className="flex flex-col items-center h-auto py-3 bg-green-100 hover:bg-green-200 text-[#0D6A51] rounded-xl"
                  >
                    <ArrowUpCircle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Retirer</span>
                  </Button>
                  
                  <Button 
                    onClick={() => handleAction('Transférer')} 
                    className="flex flex-col items-center h-auto py-3 bg-green-100 hover:bg-green-200 text-[#0D6A51] rounded-xl"
                  >
                    <ArrowRightCircle className="h-6 w-6 mb-1" />
                    <span className="text-xs">Transférer</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Transactions section */}
            <div className="bg-white rounded-lg shadow-sm p-4 border-0">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium">Transactions</h2>
                <Button variant="outline" size="sm" className="text-xs h-8 flex items-center gap-1">
                  {month}
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-[#0D6A51]">
                        {transaction.avatar ? (
                          <img src={transaction.avatar} alt={transaction.name} className="h-10 w-10 rounded-full" />
                        ) : (
                          <CircleDollarSign className="h-5 w-5" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{transaction.name}</p>
                        <p className="text-xs text-gray-500">{transaction.type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${transaction.amount.startsWith('+') ? 'text-green-600' : 'text-gray-800'}`}>
                        {transaction.amount} FCFA
                      </p>
                      <p className="text-xs text-gray-500">{transaction.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Goals section */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="border shadow-sm">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium mb-2">Acheter une moto</h3>
                  <p className="text-xs text-gray-600 mb-1">• Dans 4 mois</p>
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs font-medium">125,000 FCFA</p>
                    <Badge className="bg-[#0D6A51] text-xs">45%</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1">
                    <div className="bg-[#0D6A51] h-1 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border border-dashed bg-transparent flex items-center justify-center">
                <Button variant="ghost" className="h-full w-full flex flex-col items-center gap-2 text-gray-500">
                  <Plus className="h-5 w-5" />
                  <span className="text-xs">Ajouter un objectif</span>
                </Button>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="payment" className="space-y-4 mt-0">
            {/* Payment Tab Content */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <Button 
                variant="outline" 
                size="sm" 
                className="mb-4" 
                onClick={() => setActiveTab('main')}
              >
                &larr; Retour
              </Button>
              <h2 className="text-lg font-medium mb-4">Options de paiement</h2>
              
              {/* Reuse the SecurePaymentLayer component */}
              <div className="bg-white p-4 rounded-lg">
                <h3 className="text-md font-medium mb-4">Choisissez votre méthode</h3>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-[#0D6A51]">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Compte SFD
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Smartphone className="mr-2 h-4 w-4" />
                    Mobile Money
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <HomeIcon className="mr-2 h-4 w-4" />
                    Paiement en agence
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
