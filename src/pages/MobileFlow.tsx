
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
  Phone as Smartphone,
  ChevronRight,
  DollarSign
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';

const MobileFlow = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const [month, setMonth] = useState('Décembre');
  const [activeTab, setActiveTab] = useState('main');
  const [currency, setCurrency] = useState('FCFA');

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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="main" className="space-y-4 mt-0 p-0">
          {/* New header */}
          <div className="bg-black text-white p-4 rounded-b-3xl">
            <div className="flex justify-between items-center mb-6">
              <Avatar className="h-10 w-10 border-2 border-white">
                <img src="/lovable-uploads/0497e073-9224-4a14-8851-577db02c0e57.png" alt="User" />
              </Avatar>
              <Avatar className="h-10 w-10 bg-gray-800 border-2 border-gray-700">
                <Settings className="h-5 w-5 text-white" />
              </Avatar>
            </div>
            
            {/* Balance section */}
            <div className="mb-4">
              <p className="text-gray-400 text-sm">Solde actuel</p>
              <div className="flex items-baseline">
                <h1 className="text-3xl font-bold">155 804</h1>
                <div className="ml-1 flex items-center">
                  <span className="text-lg">.83</span>
                  <Button variant="outline" size="sm" className="ml-2 h-7 text-xs border-gray-600 text-gray-300 rounded-xl">
                    {currency} <ChevronDown className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Instant Float Section */}
          <div className="mx-4 -mt-2">
            <Card className="border-0 shadow-sm bg-white rounded-xl overflow-hidden">
              <CardContent className="p-4">
                <p className="text-sm font-medium mb-1">Accès rapide</p>
                <p className="text-xs text-gray-500 mb-3">100 000 FCFA disponible</p>
                
                <Button 
                  onClick={() => handleAction('Float me cash')} 
                  variant="outline"
                  className="w-full justify-between bg-gray-50 hover:bg-gray-100 border-0 rounded-xl py-5 mb-2"
                >
                  <div className="flex items-center">
                    <div className="bg-black text-white p-2 rounded-full mr-3">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span>Obtenir un prêt rapide</span>
                  </div>
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </CardContent>
            </Card>
          </div>
          
          {/* Incomes & Spendings */}
          <div className="px-4">
            <h2 className="font-medium text-lg mb-3">Revenus & dépenses</h2>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <Card className="bg-green-100 border-0 rounded-xl">
                <CardContent className="p-4 flex flex-col">
                  <div className="rounded-full bg-green-200 w-12 h-12 flex items-center justify-center mb-3">
                    <div className="rounded-full bg-green-300 w-10 h-10 flex items-center justify-center">
                      {/* Semi-circle chart */}
                      <div className="rotate-180 w-8 h-4 overflow-hidden">
                        <div className="h-8 w-8 rounded-full border-4 border-green-500 -translate-y-4"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl font-bold">1 845 810</p>
                  <p className="text-xs text-gray-600">Dépensé</p>
                </CardContent>
              </Card>
              
              <Card className="bg-purple-100 border-0 rounded-xl">
                <CardContent className="p-4 flex flex-col">
                  <div className="rounded-full bg-purple-200 w-12 h-12 flex items-center justify-center mb-3">
                    <div className="rounded-full bg-purple-300 w-10 h-10 flex items-center justify-center">
                      {/* Semi-circle chart */}
                      <div className="w-8 h-4 overflow-hidden">
                        <div className="h-8 w-8 rounded-full border-4 border-purple-500 translate-y-4"></div>
                      </div>
                    </div>
                  </div>
                  <p className="text-xl font-bold">1 365 320</p>
                  <p className="text-xs text-gray-600">Reçu</p>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Transactions section */}
          <div className="px-4">
            <h2 className="font-medium text-lg mb-3">Transactions</h2>
            <div className="bg-white rounded-xl shadow-sm p-4 border-0">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-black">
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
            
            <div className="bg-white p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">Choisissez votre méthode</h3>
              <div className="space-y-3">
                <Button className="w-full justify-start bg-black hover:bg-gray-800">
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
      
      <MobileNavigation />
    </div>
  );
};

export default MobileFlow;
