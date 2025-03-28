
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
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import InstantLoanPage from '@/components/mobile/InstantLoanPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';

const MobileFlowPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isLoading, hasPermission } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Extract the sub-path from /mobile-flow/X
  const getSubPath = () => {
    const path = location.pathname;
    // If exactly /mobile-flow or /mobile-flow/
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
  
  // Redirect if user is not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      navigate('/auth');
    }
  }, [user, isLoading, navigate]);
  
  // Check permissions to access pages
  useEffect(() => {
    if (!isLoading && user) {
      // Permission required to access mobile app
      if (!hasPermission('access_mobile_app')) {
        navigate('/auth');
        return;
      }
      
      // Permission required for SFD clients (SFD admin only)
      if (subPath === 'sfd-clients' && !hasPermission('manage_sfd_clients')) {
        navigate('/mobile-flow/main');
        return;
      }
    }
  }, [user, isLoading, subPath, hasPermission, navigate]);
  
  // Redirect unknown paths to dashboard
  useEffect(() => {
    const validPaths = ['main', 'profile', 'create-sfd', 'secure-payment', 'sfd-clients', 'loan-details', 'apply-loan', 'loan-agreement'];
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
      navigate('/mobile-flow/apply-loan');
    }
    if (action === 'Repayment' && data?.loanId) {
      navigate(`/mobile-flow/loan-details/${data.loanId}`);
    }
    if (action === 'Send' || action === 'Receive') {
      navigate('/mobile-flow/secure-payment');
    }
  };
  
  // If loading or user null, show loader
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
        // Check if user has permission to manage SFDs
        return hasPermission('manage_sfds') ? <SfdSetupPage /> : (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        );
      case 'secure-payment':
        return <SecurePaymentTab onBack={() => navigate(-1)} />;
      case 'sfd-clients':
        // Check if user has permission to manage SFD clients
        return hasPermission('manage_sfd_clients') ? <SfdClientsPage /> : (
          <div className="p-4 text-center">
            <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
            <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          </div>
        );
      case 'loan-details':
        return <LoanDetailsPage onBack={() => navigate('/mobile-flow')} />;
      case 'apply-loan':
        return <InstantLoanPage />;
      case 'loan-agreement':
        return <LoanAgreementPage />;
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
        // Filter navigation based on permissions
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
