
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import DashboardContent from '@/components/mobile/dashboard/DashboardContent';
import Footer from '@/components/Footer';
import MobileNavigation from '@/components/mobile/MobileNavigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Menu, RefreshCw } from 'lucide-react';
import MobileDrawerMenu from '@/components/mobile/menu/MobileDrawerMenu';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';

const MobileMainPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { synchronizeWithSfd, isSyncing } = useRealtimeSynchronization();
  
  const handleAction = (action: string, data?: any) => {
    switch (action) {
      case 'Loans':
        navigate('/mobile-flow/loans');
        break;
      case 'LoanPlans':
        navigate('/mobile-flow/loan-plans');
        break;
      case 'MyLoans':
        navigate('/mobile-flow/my-loans');
        break;
      case 'Transactions':
        navigate('/mobile-flow/transactions');
        break;
      case 'Payment':
        navigate('/mobile-flow/payment');
        break;
      case 'Account':
        navigate('/mobile-flow/account');
        break;
      default:
        // Si l'action a des données associées, les passer via state
        if (data) {
          navigate(`/mobile-flow/${action.toLowerCase()}`, { state: data });
        } else {
          navigate(`/mobile-flow/${action.toLowerCase()}`);
        }
    }
  };
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };
  
  const handleManualSync = async () => {
    await synchronizeWithSfd();
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="bg-[#0D6A51] text-white p-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium italic">Votre partenaire financier de confiance</h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10" 
              disabled={isSyncing}
              onClick={handleManualSync}
            >
              <RefreshCw className={`h-5 w-5 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              className="text-white hover:bg-white/10" 
              onClick={() => setMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      
      <div className="px-4 py-4">
        <DashboardContent onRefresh={handleManualSync} />
      </div>
      
      <MobileDrawerMenu 
        isOpen={menuOpen}
        onClose={() => setMenuOpen(false)}
        onLogout={handleLogout}
      />
      
      <Footer />
      <MobileNavigation />
    </div>
  );
};

export default MobileMainPage;
