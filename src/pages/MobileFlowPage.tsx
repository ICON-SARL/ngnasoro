
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainDashboard } from '@/components/mobile/dashboard';
import MobileMenu from '@/components/mobile/menu/MobileMenu';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import { useAuth } from '@/hooks/auth';
import SecurePaymentTab from '@/components/mobile/secure-payment';
import { Account } from '@/types/transactions';
import MobileNavigation from '@/components/MobileNavigation';
import { useActionHandler } from '@/utils/actionHandler';

const MobileFlowPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const { handleAction } = useActionHandler();
  
  // Cette fonction extrait le sous-chemin du path /mobile-flow/X
  const getSubPath = () => {
    const path = location.pathname;
    // Si c'est exactement /mobile-flow ou /mobile-flow/
    if (path === '/mobile-flow' || path === '/mobile-flow/') {
      return 'main';
    }
    
    // Sinon extraire le sous-chemin
    const parts = path.split('/');
    if (parts.length >= 3) {
      return parts[2]; // /mobile-flow/X -> X
    }
    
    return 'main';
  };
  
  const subPath = getSubPath();
  
  // Rediriger si l'utilisateur n'est pas connecté
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // Rediriger les chemins inconnus vers le dashboard
  useEffect(() => {
    const validPaths = ['main', 'profile', 'create-sfd', 'secure-payment', 'sfd-clients', 'funds-management', 'loan-application'];
    if (!validPaths.includes(subPath)) {
      console.log(`Redirecting from unknown path: ${subPath} to main dashboard`);
      navigate('/mobile-flow/main');
    }
  }, [subPath, navigate]);
  
  // Handle mock data for dashboard
  const mockAccount: Account = {
    id: 'account-1',
    user_id: user?.id || '',
    balance: 50000,
    currency: 'FCFA',
    updated_at: new Date().toISOString()
  };
  
  const mockTransactions = [
    { id: 1, name: 'Dépôt', type: 'deposit', amount: 10000, date: new Date().toISOString(), avatar_url: '' },
    { id: 2, name: 'Retrait', type: 'withdrawal', amount: -5000, date: new Date().toISOString(), avatar_url: '' }
  ];
  
  // Toggle menu
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };
  
  // Handle logout
  const handleLogout = () => {
    // Add logout logic here
    navigate('/auth');
  };
  
  // Si chargement en cours ou user null, montrer un loader
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  const onAction = (action: string, data?: any) => {
    handleAction(action, data);
  };
  
  const renderContent = () => {
    switch (subPath) {
      case 'main':
        return (
          <MainDashboard 
            onAction={onAction}
            account={mockAccount}
            transactions={mockTransactions}
            transactionsLoading={false}
            toggleMenu={toggleMenu}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'create-sfd':
        return <SfdSetupPage />;
      case 'secure-payment':
        return <SecurePaymentTab onBack={() => navigate(-1)} />;
      case 'sfd-clients':
        return <SfdClientsPage />;
      default:
        return (
          <MainDashboard 
            onAction={onAction}
            account={mockAccount}
            transactions={mockTransactions}
            transactionsLoading={false}
            toggleMenu={toggleMenu}
          />
        );
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 w-full h-full">
        {renderContent()}
      </main>
      
      <MobileNavigation onAction={onAction} />
      
      <MobileMenu 
        isOpen={menuOpen} 
        onClose={toggleMenu} 
        onLogout={handleLogout}
      />
    </div>
  );
};

export default MobileFlowPage;
