
import React from 'react';
import { useNavigate } from 'react-router-dom';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CreditCard, ArrowRight, Plus, Wallet, ArrowUpDown } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useClientLoans } from '@/hooks/useClientLoans';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { formatCurrencyAmount } from '@/utils/transactionUtils';

const MobileHomePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { loans, isLoading: loansLoading } = useClientLoans();
  const { accounts, sfdAccounts, isLoading: accountsLoading } = useSfdAccounts();
  
  const totalBalance = sfdAccounts?.reduce((sum, account) => sum + (account.balance || 0), 0) || 0;
  const activeLoanCount = loans?.filter(loan => loan.status === 'active')?.length || 0;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white p-4 shadow-sm">
        <h1 className="text-xl font-bold">Accueil</h1>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-3 gap-3 mb-6">
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
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/my-loans')}
              >
                <CreditCard className="h-5 w-5" />
              </Button>
              <span className="text-sm">Mes prêts</span>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => navigate('/mobile-flow/funds')}
              >
                <Wallet className="h-5 w-5" />
              </Button>
              <span className="text-sm">Mes fonds</span>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Mes prêts actifs</h2>
            <Button 
              variant="ghost" 
              className="text-sm text-[#0D6A51] p-0 h-auto font-medium"
              onClick={() => navigate('/mobile-flow/my-loans')}
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {loansLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : activeLoanCount > 0 ? (
                <div>
                  <p className="font-medium">Vous avez {activeLoanCount} prêt{activeLoanCount > 1 ? 's' : ''} actif{activeLoanCount > 1 ? 's' : ''}</p>
                  <Button 
                    variant="outline" 
                    className="mt-3 w-full"
                    onClick={() => navigate('/mobile-flow/my-loans')}
                  >
                    Voir mes prêts
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Pas de prêts actifs</h3>
                  <p className="text-sm text-gray-500 mb-3">Vous n'avez pas de prêts en cours</p>
                  <Button 
                    variant="outline"
                    className="border-[#0D6A51] text-[#0D6A51]"
                    onClick={() => navigate('/mobile-flow/loans')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Demander un prêt
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Mes fonds</h2>
            <Button 
              variant="ghost" 
              className="text-sm text-[#0D6A51] p-0 h-auto font-medium"
              onClick={() => navigate('/mobile-flow/funds')}
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              {accountsLoading ? (
                <div className="animate-pulse space-y-3">
                  <div className="h-12 bg-gray-200 rounded"></div>
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : sfdAccounts?.length > 0 ? (
                <div>
                  <p className="font-medium mb-1">Solde total</p>
                  <p className="text-2xl font-semibold mb-3">{formatCurrencyAmount(totalBalance)} FCFA</p>
                  <Button 
                    className="w-full bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    onClick={() => navigate('/mobile-flow/transfer')}
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Faire un transfert
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Aucun compte</h3>
                  <p className="text-sm text-gray-500">Connectez-vous à une SFD pour gérer vos fonds</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNavigation />
    </div>
  );
};

export default MobileHomePage;
