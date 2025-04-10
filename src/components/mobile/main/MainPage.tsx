
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, Clock, Menu } from 'lucide-react';

interface MainPageProps {
  account: any;
  transactions: any[];
  isLoading: boolean;
  toggleMenu: () => void;
}

const MainPage: React.FC<MainPageProps> = ({ 
  account, 
  transactions, 
  isLoading,
  toggleMenu
}) => {
  const navigate = useNavigate();
  
  const handlePaymentClick = () => {
    navigate('/mobile-flow/payment');
  };
  
  const handleTransactionsClick = () => {
    navigate('/mobile-flow/transactions');
  };

  return (
    <div className="pb-20 font-montserrat">
      <div className="bg-[#0D6A51] pb-6 pt-4 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <img src="/logo-white.svg" alt="Logo" className="h-8" />
          </div>
          <Button variant="ghost" size="icon" className="text-white" onClick={toggleMenu}>
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        
        <div className="text-white">
          <p className="text-sm opacity-80">Solde disponible</p>
          <h1 className="text-3xl font-bold">{account?.balance?.toLocaleString()} FCFA</h1>
        </div>
      </div>
      
      <div className="px-4 py-6">
        <div className="grid grid-cols-2 gap-3 mb-8">
          <Button 
            onClick={handlePaymentClick}
            className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 h-auto py-4 flex flex-col items-center"
          >
            <ArrowUpRight className="mb-1 h-5 w-5" />
            <span>Envoyer</span>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-auto py-4 flex flex-col items-center border-[#0D6A51] text-[#0D6A51]"
          >
            <ArrowDownRight className="mb-1 h-5 w-5" />
            <span>Recevoir</span>
          </Button>
        </div>
        
        <div className="mb-4 flex justify-between items-center">
          <h2 className="font-semibold text-lg">Transactions récentes</h2>
          <Button variant="ghost" size="sm" onClick={handleTransactionsClick}>
            Voir tout
          </Button>
        </div>
        
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="animate-spin h-6 w-6 border-2 border-[#0D6A51] border-t-transparent rounded-full mx-auto"></div>
            <p className="text-sm text-gray-500 mt-2">Chargement...</p>
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center">
              <Clock className="h-10 w-10 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Aucune transaction récente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 5).map((transaction, index) => (
              <Card key={index}>
                <CardContent className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                      {transaction.type === 'deposit' ? (
                        <ArrowDownRight className="h-5 w-5 text-green-600" />
                      ) : (
                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className={`font-semibold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.amount > 0 ? '+' : ''}{transaction.amount.toLocaleString()} FCFA
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MainPage;
