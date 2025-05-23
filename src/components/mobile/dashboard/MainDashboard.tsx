
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ArrowUpDown, Wallet, Menu } from 'lucide-react';
import { Account } from '@/types/transactions';
import { Transaction } from '@/types/transactions';
import TransactionList from '../TransactionList';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';

export interface MainDashboardProps {
  onAction?: (newView: string, data?: any) => void;
  account?: Account | null;
  transactions?: Transaction[];
  transactionsLoading?: boolean;
  toggleMenu?: () => void;
}

const MainDashboard: React.FC<MainDashboardProps> = ({
  onAction,
  account,
  transactions = [],
  transactionsLoading = false,
  toggleMenu
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  
  const handleOpenMenu = () => {
    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  return (
    <div className="pb-20">
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Tableau de Bord</h1>
          <Button variant="ghost" className="text-white" onClick={handleOpenMenu}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
        
        <Card className="mt-4 bg-[#0D6A51]/20 text-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm opacity-90">Solde disponible</span>
            </div>
            <div className="text-2xl font-bold mb-2">
              {account ? `${account.balance.toLocaleString('fr-FR')} FCFA` : '0 FCFA'}
            </div>
            <div className="flex gap-2 mt-2">
              <Button 
                className="bg-white text-[#0D6A51] hover:bg-white/90 text-sm flex-1"
                onClick={() => onAction && onAction('Payment')}
              >
                <Wallet className="h-4 w-4 mr-1" />
                Paiement
              </Button>
              <Button 
                className="bg-white/20 text-white hover:bg-white/30 text-sm flex-1"
                onClick={() => onAction && onAction('Transactions')}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                Transactions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="px-4 py-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-lg font-semibold">Actions rapides</h2>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-3 flex flex-col items-center justify-center">
              <Button
                className="w-12 h-12 rounded-full bg-[#0D6A51] hover:bg-[#0D6A51]/90 mb-2"
                onClick={() => onAction && onAction('Transactions')}
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
                onClick={() => onAction && onAction('Savings')}
              >
                <Wallet className="h-5 w-5" />
              </Button>
              <span className="text-sm">Épargne</span>
            </CardContent>
          </Card>
        </div>
        
        <TransactionList 
          transactions={transactions || []} 
          isLoading={transactionsLoading || false}
          onViewAll={() => onAction && onAction('Transactions')}
        />
      </div>

      <MobileDrawerMenu 
        isOpen={menuOpen}
        onClose={handleCloseMenu}
      />

      <div className="fixed bottom-0 left-0 right-0 z-40 sm:hidden">
        <MobileNavigation />
      </div>
    </div>
  );
};

export default MainDashboard;
