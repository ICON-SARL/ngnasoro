
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { useMobilePermissions } from '@/hooks/mobile/useMobilePermissions';

// Components
import { MainDashboard } from '@/components/mobile/dashboard';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SecurePaymentTab from '@/components/mobile/secure-payment';
import LoanDetailsPage from '@/components/mobile/LoanDetailsPage';
import InstantLoanPage from '@/components/mobile/InstantLoanPage';
import LoanAgreementPage from '@/components/mobile/LoanAgreementPage';
import SfdAdminDashboard from '@/components/mobile/sfd-admin/SfdAdminDashboard';

// Mock data
import { Account } from '@/types/transactions';

interface PageContentProps {
  toggleMenu: () => void;
  subPath: string;
}

const PageContent: React.FC<PageContentProps> = ({ toggleMenu, subPath }) => {
  const navigate = useNavigate();
  const { user, hasPermission } = useAuth();
  const { checkPermissionWithRedirect } = useMobilePermissions();
  
  // Redirect unknown paths to dashboard
  useEffect(() => {
    const validPaths = ['main', 'profile', 'create-sfd', 'secure-payment', 'sfd-clients', 'loan-details', 'apply-loan', 'loan-agreement', 'sfd-admin-dashboard'];
    if (!validPaths.includes(subPath)) {
      console.log(`Redirecting from unknown path: ${subPath} to main dashboard`);
      navigate('/mobile-flow/main');
    }
  }, [subPath, navigate]);
  
  // Check permissions for specific pages
  useEffect(() => {
    if (!user) return;
    
    // Permission required to access mobile app
    if (!hasPermission('access_mobile_app')) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les permissions nécessaires pour accéder à l'application mobile",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }
    
    // Check permissions for specific pages
    if (subPath === 'sfd-clients') {
      checkPermissionWithRedirect('manage_sfd_clients');
    }
    
    if (subPath === 'apply-loan') {
      checkPermissionWithRedirect('apply_for_loans');
    }
    
    if (subPath === 'sfd-admin-dashboard') {
      checkPermissionWithRedirect('manage_sfd_loans');
    }
  }, [user, subPath, hasPermission, navigate, checkPermissionWithRedirect]);
  
  // Mock data for dashboard
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
  
  // Mock action handler
  const handleAction = (action: string, data?: any) => {
    console.log('Action:', action, data);
    if (action === 'Loans' && hasPermission('apply_for_loans')) {
      navigate('/mobile-flow/apply-loan');
    }
    if (action === 'Repayment' && data?.loanId) {
      navigate(`/mobile-flow/loan-details/${data.loanId}`);
    }
    if ((action === 'Send' || action === 'Receive') && hasPermission('make_transfers')) {
      navigate('/mobile-flow/secure-payment');
    }
  };
  
  return renderContent(subPath, {
    handleAction,
    mockAccount,
    mockTransactions,
    toggleMenu,
    hasPermission,
    navigate
  });
};

// Separate function to render the appropriate content based on the subPath
const renderContent = (
  subPath: string, 
  props: { 
    handleAction: (action: string, data?: any) => void;
    mockAccount: Account;
    mockTransactions: any[];
    toggleMenu: () => void;
    hasPermission: (permission: string) => boolean;
    navigate: (path: string) => void;
  }
) => {
  const { handleAction, mockAccount, mockTransactions, toggleMenu, hasPermission, navigate } = props;
  
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
      return hasPermission('make_transfers') ? <SecurePaymentTab onBack={() => navigate('/mobile-flow/main')} /> : (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p>Vous n'avez pas les permissions nécessaires pour effectuer des transferts.</p>
        </div>
      );
    case 'sfd-clients':
      // Check if user has permission to manage SFD clients
      return hasPermission('manage_sfd_clients') ? <SfdClientsPage /> : (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      );
    case 'sfd-admin-dashboard':
      // Check if user has permission to manage SFD loans
      return hasPermission('manage_sfd_loans') ? <SfdAdminDashboard /> : (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      );
    case 'loan-details':
      return <LoanDetailsPage onBack={() => navigate('/mobile-flow/main')} />;
    case 'apply-loan':
      return hasPermission('apply_for_loans') ? <InstantLoanPage /> : (
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Accès restreint</h2>
          <p>Vous n'avez pas les permissions nécessaires pour demander un prêt.</p>
        </div>
      );
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

export default PageContent;
