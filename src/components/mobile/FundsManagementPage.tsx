
import React, { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Wallet, ArrowDown, ArrowUp, ChevronRight, Building, Phone, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import SecurePaymentTab from './SecurePaymentTab';
import TransactionList from './TransactionList';
import { useTransactions } from '@/hooks/useTransactions';

const FundsManagementPage = () => {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'main' | 'withdraw' | 'deposit'>('main');
  const { transactions, isLoading: transactionsLoading } = useTransactions();
  
  const handleBack = () => {
    if (activeView !== 'main') {
      setActiveView('main');
    } else {
      navigate('/mobile-flow/main');
    }
  };
  
  return (
    <div className="bg-white min-h-screen">
      {activeView === 'main' ? (
        <>
          <div className="bg-gradient-to-r from-[#0D6A51] to-[#0D6A51]/90 text-white p-4">
            <div className="flex items-center mb-2">
              <Button variant="ghost" className="p-1 text-white" onClick={handleBack}>
                <ArrowLeft className="h-6 w-6" />
              </Button>
              <h1 className="text-lg font-bold ml-2">Gestion des Fonds</h1>
            </div>
            
            <div className="mt-4 mb-6 flex flex-col items-center">
              <p className="text-sm mb-1">Solde disponible</p>
              <p className="text-3xl font-bold">198 500 FCFA</p>
              <div className="mt-4 flex space-x-3">
                <Button 
                  onClick={() => setActiveView('withdraw')}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-4 flex items-center"
                >
                  <ArrowUp className="h-4 w-4 mr-2" />
                  Retirer
                </Button>
                <Button 
                  onClick={() => navigate('/mobile-flow/secure-payment')}
                  className="bg-white/20 hover:bg-white/30 text-white rounded-full py-2 px-4 flex items-center"
                >
                  <ArrowDown className="h-4 w-4 mr-2" />
                  Rembourser
                </Button>
              </div>
            </div>
          </div>
          
          <div className="p-4 space-y-6 mt-2">
            <h2 className="text-lg font-semibold">Options de transfert</h2>
            
            <Card className="border hover:border-teal-500 cursor-pointer" onClick={() => setActiveView('withdraw')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                      <Wallet className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Retirer des fonds</h3>
                      <p className="text-xs text-gray-500">Vers Mobile Money ou en agence</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border hover:border-teal-500 cursor-pointer" onClick={() => navigate('/mobile-flow/secure-payment')}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mr-3">
                      <CreditCard className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-medium">Rembourser un prêt</h3>
                      <p className="text-xs text-gray-500">Mobile Money ou compte SFD</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
            
            <h2 className="text-lg font-semibold mt-6">Canaux disponibles</h2>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="border">
                <CardContent className="p-3 flex flex-col items-center">
                  <Building className="h-8 w-8 text-[#0D6A51] mb-2" />
                  <p className="text-sm font-medium">Agence SFD</p>
                  <p className="text-xs text-gray-500">Via QR Code</p>
                </CardContent>
              </Card>
              
              <Card className="border">
                <CardContent className="p-3 flex flex-col items-center">
                  <Phone className="h-8 w-8 text-orange-500 mb-2" />
                  <p className="text-sm font-medium">Mobile Money</p>
                  <p className="text-xs text-gray-500">Orange, MTN, Wave</p>
                </CardContent>
              </Card>
            </div>
            
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
              onViewAll={() => {}}
              title="Transactions récentes"
            />
          </div>
        </>
      ) : (
        <SecurePaymentTab onBack={handleBack} isWithdrawal={activeView === 'withdraw'} />
      )}
    </div>
  );
};

export default FundsManagementPage;
