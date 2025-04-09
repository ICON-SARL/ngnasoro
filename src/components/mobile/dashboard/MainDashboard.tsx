
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Account } from '@/types/transactions';
import NoSfdAccountCard from '@/components/mobile/profile/sfd-accounts/NoSfdAccountCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface MainDashboardProps {
  onAction: (action: string, data?: any) => void;
  account: Account;
  transactions: any[];
  transactionsLoading: boolean;
  toggleMenu: () => void;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  onAction,
  account,
  transactions,
  transactionsLoading,
  toggleMenu
}) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hasSfdAccount, setHasSfdAccount] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSfdAccount = async () => {
      if (!user?.id) return;
      
      try {
        // Check if user has any SFD associations
        const { data, error } = await fetch('/api/user/has-sfd-account')
          .then(res => res.json());
          
        if (error) throw error;
        
        setHasSfdAccount(data?.hasSfdAccount || false);
      } catch (error) {
        console.error('Error checking SFD account:', error);
        // Default to false if there's an error
        setHasSfdAccount(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    // For now, we'll mock this check
    // In a real implementation, you'd use the API call above
    const mockCheck = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      setHasSfdAccount(false);
      setIsLoading(false);
    };
    
    mockCheck();
  }, [user]);
  
  const navigateTo = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
        </div>
      ) : !hasSfdAccount ? (
        <NoSfdAccountCard />
      ) : (
        // Show account dashboard if user has SFD account
        <div className="space-y-6">
          {/* Account balance card */}
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-2">Solde compte</h2>
              <p className="text-3xl font-bold text-[#0D6A51]">
                {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(account.balance)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Dernière mise à jour: {new Date(account.updated_at).toLocaleString('fr-FR')}
              </p>
            </CardContent>
          </Card>
          
          {/* Quick actions */}
          <div className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigateTo('/mobile-flow/loan-application')}
            >
              <span className="text-lg mb-1">💰</span>
              <span>Demander un prêt</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col items-center justify-center"
              onClick={() => navigateTo('/mobile-flow/payment-options')}
            >
              <span className="text-lg mb-1">💳</span>
              <span>Effectuer un paiement</span>
            </Button>
          </div>
        </div>
      )}
      
      {/* Recent transactions section */}
      <div className="mt-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Transactions Récentes</h2>
          <Button 
            variant="link" 
            onClick={() => navigateTo('/mobile-flow/loan-activity')}
            className="text-[#0D6A51]"
          >
            Voir Prêts
          </Button>
        </div>
        
        {transactionsLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-[#0D6A51]"></div>
          </div>
        ) : transactions.length > 0 ? (
          <div className="space-y-2">
            {transactions.map((transaction, index) => (
              <div 
                key={index}
                className="bg-white rounded-lg shadow p-3 flex justify-between items-center"
              >
                <div className="flex items-center">
                  <div className="mr-3 bg-gray-100 rounded-full w-10 h-10 flex items-center justify-center">
                    {transaction.avatar_url ? (
                      <img 
                        src={transaction.avatar_url} 
                        alt={transaction.name} 
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <span>{transaction.type === 'deposit' ? '↓' : '↑'}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <span className={`font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}
                  {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF' }).format(transaction.amount)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">Aucune transaction récente</p>
          </div>
        )}
      </div>
    </div>
  );
};
