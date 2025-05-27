
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { MobileRouter } from './components/Router';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import SfdLoginPage from './pages/SfdLoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import SfdClientsPage from './pages/SfdClientsPage';
import LoansPage from './pages/LoansPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import { SfdHeader } from './components/sfd/SfdHeader';
import RoleGuard from './components/RoleGuard';

const router = createBrowserRouter([
  // Main app routes
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <div>Welcome to the App</div>,
      },
      {
        path: 'auth',
        element: <div>Authentication Page</div>,
      },
      {
        path: 'dashboard',
        element: <div>Dashboard Page</div>,
      },
      {
        path: 'admin',
        children: [
          {
            path: 'loan-plans',
            element: <div>Admin Loan Plans</div>,
          },
        ],
      },
    ],
  },
  
  // Super Admin routes
  {
    path: '/super-admin-dashboard',
    element: (
      <RoleGuard requiredRole="admin" fallbackPath="/access-denied">
        <SuperAdminDashboard />
      </RoleGuard>
    ),
  },
  
  // SFD Admin routes
  {
    path: '/agency-dashboard',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <div className="min-h-screen bg-gray-50">
          <SfdHeader />
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Tableau de bord SFD</h1>
            <p className="text-gray-600">Gérez votre SFD et suivez les activités</p>
          </div>
        </div>
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-clients',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <SfdClientsPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-loans',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <LoansPage />
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-transactions',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <div className="min-h-screen bg-gray-50">
          <SfdHeader />
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Transactions SFD</h1>
            <p className="text-gray-600">Gestion des transactions de la SFD</p>
          </div>
        </div>
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-adhesion-requests',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <div className="min-h-screen bg-gray-50">
          <SfdHeader />
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Demandes d'adhésion</h1>
            <p className="text-gray-600">Gestion des demandes d'adhésion des clients</p>
          </div>
        </div>
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-subsidy-requests',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <div className="min-h-screen bg-gray-50">
          <SfdHeader />
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Demandes de subvention</h1>
            <p className="text-gray-600">Gestion des demandes de subvention</p>
          </div>
        </div>
      </RoleGuard>
    ),
  },
  {
    path: '/sfd-settings',
    element: (
      <RoleGuard requiredRole="sfd_admin" fallbackPath="/access-denied">
        <div className="min-h-screen bg-gray-50">
          <SfdHeader />
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold">Paramètres SFD</h1>
            <p className="text-gray-600">Configuration de votre SFD</p>
          </div>
        </div>
      </RoleGuard>
    ),
  },
  
  // Auth routes
  {
    path: '/sfd/auth',
    element: <SfdLoginPage />,
  },
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/access-denied',
    element: <UnauthorizedPage />,
  },
  
  // Mobile routes
  {
    path: '/mobile-flow',
    element: <MobileFlowPage />,
    children: [
      {
        path: 'dashboard',
        element: <MobileRouter />,
      },
      {
        path: 'profile',
        element: <MobileRouter />,
      },
      {
        path: 'loans',
        element: <MobileRouter />,
      },
      {
        path: 'funds-management',
        element: <FundsManagementPage />,
      },
      {
        path: 'transactions',
        element: <MobileRouter />,
      },
      {
        path: 'loan-application',
        element: <MobileLoanApplicationPage />,
      },
      {
        path: 'loan-application/:planId',
        element: <MobileLoanApplicationPage />,
      },
      {
        path: 'loan-details/:loanId',
        element: <LoanDetailsPage />,
      },
      {
        path: 'diagnostics',
        element: <MobileDiagnosticsPage />,
      },
      {
        index: true,
        element: <MobileRouter />,
      }
    ],
  },
]);

export default router;
