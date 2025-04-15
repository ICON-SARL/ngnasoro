
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileMenu from './menu/MobileDrawerMenu';
import MobileHeader from './MobileHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Plus, CreditCard, ArrowUpDown, Wallet } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useSfdAccounts } from '@/hooks/useSfdAccounts';
import { formatCurrencyAmount } from '@/utils/transactionUtils';
import MobileNavigation from './MobileNavigation';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const { accounts, sfdAccounts, isLoading: accountsLoading } = useSfdAccounts();
  
  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClose = () => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    // Logout functionality will be added later
    navigate('/auth');
  };
  
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
              className="text-sm text-[#0D6A51] p-0 h-auto font-medium"
              onClick={() => navigate('/mobile-flow/loans')}
            >
              Voir tout <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
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
            </CardContent>
          </Card>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold">Transactions récentes</h2>
            <Button 
              variant="ghost" 
              className="text-sm text-[#0D6A51] p-0 h-auto font-medium"
              onClick={() => navigate('/mobile-flow/transactions')}
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
                  <div className="h-12 bg-gray-200 rounded"></div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <h3 className="font-medium mb-1">Pas de transactions</h3>
                  <p className="text-sm text-gray-500">Vos transactions récentes apparaîtront ici</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <MobileMenu 
        isOpen={isMenuOpen}
        onClose={handleMenuClose}
        onLogout={handleLogout}
      />
      
      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default MobileMainPage;
