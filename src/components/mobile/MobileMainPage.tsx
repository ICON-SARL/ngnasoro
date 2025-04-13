
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './MobileMenu';
import MobileHeader from './MobileHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CreditCard, ArrowUpDown } from 'lucide-react';
import TransactionList from './TransactionList';
import { useTransactions } from '@/hooks/useTransactions';
import { useAuth } from '@/hooks/useAuth';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { transactions, isLoading } = useTransactions(user?.id || '', '');
  
  const recentTransactions = transactions.slice(0, 5).map(transaction => ({
    id: transaction.id,
    name: transaction.name,
    type: transaction.type,
    amount: `${transaction.amount > 0 ? '+' : ''}${transaction.amount.toLocaleString('fr-FR')} FCFA`,
    date: new Date(transaction.date || transaction.created_at).toLocaleDateString('fr-FR'),
    avatar: transaction.avatar_url
  }));
  
  return (
    <div className="pb-16">
      <MobileHeader />
      
      <div className="px-4 py-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Actions rapides</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/transfer')}
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
              <span className="text-sm">Transfert</span>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/loans')}
              >
                <CreditCard className="h-5 w-5" />
              </Button>
              <span className="text-sm">Prêts</span>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Mes prêts actifs</h2>
            <Button 
              variant="ghost" 
              className="text-[#0D6A51] p-0 h-auto"
              onClick={() => navigate('/mobile-flow/my-loans')}
            >
              Voir tous <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <Card className="border-0 shadow-sm mb-3">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <div>
                  <p className="font-medium">Microfinance Bamako</p>
                  <p className="text-xs text-gray-500">Prochain paiement: 10/07/2023</p>
                </div>
                <p className="font-semibold">25 400 FCFA</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }} />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Remboursé: 40%</span>
                <span>Reste: 15 000 FCFA</span>
              </div>
            </CardContent>
          </Card>
          
          <Button 
            variant="outline" 
            className="w-full bg-white border-dashed border-gray-300 text-gray-500"
            onClick={() => navigate('/mobile-flow/loans')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau prêt
          </Button>
        </div>
        
        <TransactionList 
          transactions={recentTransactions} 
          isLoading={isLoading}
          onViewAll={() => navigate('/mobile-flow/transactions')}
        />
      </div>
      
      <MobileMenu />
    </div>
  );
};

export default MobileMainPage;
