
import React from 'react';
import MobileHeader from '@/components/mobile/MobileHeader';
import { Account } from '@/types/transactions';
import { Button } from '@/components/ui/button';
import { ArrowRight, CreditCard, PiggyBank } from 'lucide-react';

interface MainPageProps {
  account: Account;
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
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#0D6A51] to-[#064335] pb-16">
      <div className="flex-none">
        <MobileHeader />
      </div>
      
      <div className="flex-1 p-4">
        {/* Account Balance Card */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-4">
          <h3 className="text-sm text-gray-500 mb-1">Solde disponible</h3>
          <div className="flex items-baseline">
            <span className="text-3xl font-bold">{account?.balance?.toLocaleString()}</span>
            <span className="ml-1 text-lg text-gray-600">{account?.currency || 'FCFA'}</span>
          </div>
          
          <div className="mt-4 flex space-x-2">
            <Button variant="outline" size="sm" className="flex-1 border-[#0D6A51] text-[#0D6A51] hover:bg-[#0D6A51] hover:text-white">
              <CreditCard className="mr-2 h-4 w-4" />
              Dépôt
            </Button>
            <Button variant="outline" size="sm" className="flex-1 border-[#0D6A51] text-[#0D6A51] hover:bg-[#0D6A51] hover:text-white">
              <PiggyBank className="mr-2 h-4 w-4" />
              Épargne
            </Button>
          </div>
        </div>
        
        {/* Recent Transactions */}
        <div className="bg-white rounded-xl shadow-xl p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Transactions récentes</h3>
            <Button variant="ghost" size="sm" className="text-[#0D6A51] p-0">
              Voir tout
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
            </div>
          ) : transactions && transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 3).map((transaction, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                      {transaction.type === 'deposit' ? 
                        <ArrowRight className="h-4 w-4 text-green-600" /> : 
                        <ArrowRight className="h-4 w-4 text-red-600 transform rotate-180" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{transaction.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className={`text-right ${
                    transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <p className="font-medium">
                      {transaction.type === 'deposit' ? '+' : '-'}
                      {Math.abs(transaction.amount).toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-4 text-gray-500">
              Aucune transaction récente
            </div>
          )}
        </div>
        
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-xl p-4">
          <h3 className="font-semibold mb-3">Actions rapides</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button className="h-auto py-3 bg-amber-500 hover:bg-amber-600">
              <div className="flex flex-col items-center">
                <CreditCard className="h-5 w-5 mb-1" />
                <span>Paiement</span>
              </div>
            </Button>
            <Button className="h-auto py-3 bg-blue-500 hover:bg-blue-600">
              <div className="flex flex-col items-center">
                <PiggyBank className="h-5 w-5 mb-1" />
                <span>Épargne</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
