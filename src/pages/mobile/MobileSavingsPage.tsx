import React, { useState } from 'react';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronRight, ArrowDown, ArrowUp, Clock, Eye, EyeOff } from 'lucide-react';
import { formatCurrency } from '@/utils/format';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { useTransactions } from '@/hooks/useTransactions';
import BalanceDisplay from '@/components/mobile/sfd-savings/BalanceDisplay';
import { canDisplayBalance } from '@/components/mobile/profile/sfd-accounts/utils/accountSorter';

const MobileSavingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeSfdAccount, isLoading: accountsLoading } = useSfdAccounts();
  const { transactions, isLoading: transactionsLoading } = useTransactions(
    user?.id, 
    activeSfdAccount?.sfd_id
  );
  const [isBalanceHidden, setIsBalanceHidden] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const toggleBalanceVisibility = () => {
    setIsBalanceHidden(!isBalanceHidden);
  };
  
  const refreshBalance = () => {
    setIsRefreshing(true);
    // Simulate a balance refresh
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1500);
  };
  
  const handleDeposit = () => {
    navigate('/mobile-flow/deposit');
  };
  
  const handleWithdraw = () => {
    navigate('/mobile-flow/withdraw');
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold">Mes fonds</h1>
          <p className="text-gray-500 text-sm">Gérez votre épargne</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleBalanceVisibility}
        >
          {isBalanceHidden ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </Button>
      </div>
      
      <div className="p-4">
        {accountsLoading ? (
          <Card>
            <CardContent className="p-4 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#0D6A51]"></div>
            </CardContent>
          </Card>
        ) : activeSfdAccount ? (
          <>
            <BalanceDisplay
              isHidden={isBalanceHidden}
              balance={activeSfdAccount.balance || 0}
              currency={activeSfdAccount.currency || 'FCFA'}
              isUpdating={isRefreshing}
              refreshBalance={refreshBalance}
              isPending={false}
              isVerified={canDisplayBalance(activeSfdAccount)}
            />
            
            <div className="grid grid-cols-2 gap-4 mt-6 mb-6">
              <Button 
                onClick={handleDeposit}
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 flex items-center gap-2 py-6"
              >
                <ArrowDown className="h-5 w-5" />
                Dépôt
              </Button>
              <Button 
                onClick={handleWithdraw}
                className="bg-gray-800 hover:bg-gray-700 flex items-center gap-2 py-6"
                disabled={!canDisplayBalance(activeSfdAccount)}
              >
                <ArrowUp className="h-5 w-5" />
                Retrait
              </Button>
            </div>
            
            <Tabs defaultValue="history" className="mt-6">
              <TabsList className="grid grid-cols-2 mb-4">
                <TabsTrigger value="history">Historique</TabsTrigger>
                <TabsTrigger value="details">Détails</TabsTrigger>
              </TabsList>
              
              <TabsContent value="history">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Dernières transactions</h3>
                    
                    {transactionsLoading ? (
                      <div className="flex justify-center py-4">
                        <Clock className="h-6 w-6 animate-spin text-gray-400" />
                      </div>
                    ) : transactions.length === 0 ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Aucune transaction à afficher</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {transactions.slice(0, 5).map((transaction, index) => (
                          <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                            <div>
                              <p className="font-medium">{transaction.name}</p>
                              <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <p className={transaction.amount > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                              {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount, 'FCFA')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      className="w-full mt-3 text-[#0D6A51]"
                      onClick={() => navigate('/mobile-flow/transactions')}
                    >
                      Voir toutes les transactions
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="details">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-3">Détails du compte</h3>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <p className="text-gray-500">SFD</p>
                        <p className="font-medium">{activeSfdAccount.name}</p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <p className="text-gray-500">Type de compte</p>
                        <p className="font-medium">Compte d'épargne</p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <p className="text-gray-500">Statut</p>
                        <p className="font-medium">
                          {canDisplayBalance(activeSfdAccount) ? 'Actif' : 'En attente de validation'}
                        </p>
                      </div>
                      <div className="flex justify-between py-2 border-b border-gray-100">
                        <p className="text-gray-500">Date d'ouverture</p>
                        <p className="font-medium">01/01/2023</p>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full mt-4"
                      onClick={() => navigate('/mobile-flow/account-settings')}
                    >
                      Paramètres du compte
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <h2 className="text-lg font-semibold mb-2">Aucun compte SFD</h2>
              <p className="text-gray-500 mb-4">
                Vous n'avez pas encore de compte d'épargne auprès d'une SFD.
              </p>
              <Button 
                className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                onClick={() => navigate('/sfd-selector')}
              >
                Connecter un SFD
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      
      <MobileNavigation />
    </div>
  );
};

export default MobileSavingsPage;
