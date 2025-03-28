
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

const MobileFlowPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, hasPermission } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
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
  
  // Vérifier les permissions pour accéder aux pages
  useEffect(() => {
    if (!isLoading && user) {
      // Permission requise pour accéder à l'app mobile
      if (!hasPermission('access_mobile_app')) {
        navigate('/auth');
        return;
      }
      
      // Permission requise pour les clients SFD (admin SFD uniquement)
      if (subPath === 'sfd-clients' && !hasPermission('manage_sfd_clients')) {
        navigate('/mobile-flow/main');
        return;
      }
    }
  }, [user, isLoading, subPath, hasPermission, navigate]);
  
  // Rediriger les chemins inconnus vers le dashboard
  useEffect(() => {
    const validPaths = ['main', 'profile', 'create-sfd', 'secure-payment', 'sfd-clients'];
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
  
  // Mock action handler
  const handleAction = (action: string, data?: any) => {
    console.log('Action:', action, data);
    if (action === 'Loans') {
      navigate('/mobile-flow/secure-payment');
    }
  };
  
  // Si chargement en cours ou user null, montrer un loader
  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }
  
  const renderContent = () => {
    switch (subPath) {
      case 'main':
        return (
          <MainDashboard 
            onAction={handleAction}
            account={mockAccount}
            transactions={mockTransactions}
            transactionsLoading={false}
            toggleMenu={toggleMenu}
          />
        );
      case 'profile':
        return <ProfilePage />;
      case 'create-sfd':
        // Vérifier si l'utilisateur a la permission de gérer les SFDs
        return hasPermission('manage_sfds') ? <SfdSetupPage /> : (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        );
      case 'secure-payment':
        return <SecurePaymentTab onBack={() => navigate(-1)} />;
      case 'sfd-clients':
        // Vérifier si l'utilisateur a la permission de gérer les clients SFD
        return hasPermission('manage_sfd_clients') ? <SfdClientsPage /> : (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        );
      default:
        return (
          <MainDashboard 
            onAction={handleAction}
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
      
      <MobileNavigation 
        onAction={handleAction} 
        // Filtre de navigation basé sur les permissions
        showLoanOption={hasPermission('apply_for_loans')}
        showAdminOption={hasPermission('manage_sfd_clients') || hasPermission('manage_sfd_loans')}
      />
      
      <MobileMenu 
        isOpen={menuOpen} 
        onClose={toggleMenu} 
        onLogout={handleLogout}
        userRole={user.app_metadata?.role}
      />
    </div>
  );
};

export default MobileFlowPage;
