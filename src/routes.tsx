
import { createBrowserRouter, Navigate } from 'react-router-dom';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import MobileDashboardPage from './pages/mobile/MobileDashboardPage';
import MobileLoansPage from './pages/mobile/MobileLoansPage';
import MobileProfilePage from './pages/mobile/MobileProfilePage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SfdLoginPage from './pages/SfdLoginPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import PendingApprovalPage from './pages/PendingApprovalPage';
import SfdClientsPage from './pages/SfdClientsPage';
import LoansPage from './pages/LoansPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import { SfdHeader } from './components/sfd/SfdHeader';
import RoleGuard from './components/RoleGuard';

const router = createBrowserRouter([
  // Default entry point - redirect to auth
  {
    path: '/',
    element: <LoginPage />,
  },
  
  // Auth routes
  {
    path: '/auth',
    element: <LoginPage />,
  },
  {
    path: '/admin/auth',
    element: <AdminLoginPage />,
  },
  {
    path: '/sfd/auth',
    element: <SfdLoginPage />,
  },
  {
    path: '/pending-approval',
    element: <PendingApprovalPage />,
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
  
  // Redirection /mobile → /mobile-flow/dashboard
  {
    path: '/mobile',
    element: <Navigate to="/mobile-flow/dashboard" replace />,
  },
  
  // Mobile client routes
  {
    path: '/mobile-flow',
    element: (
      <RoleGuard requiredRole="client" fallbackPath="/access-denied">
        <MobileFlowPage />
      </RoleGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <MobileDashboardPage />,
      },
      {
        path: 'main',
        element: <Navigate to="/mobile-flow/dashboard" replace />,
      },
      {
        path: 'profile',
        element: <MobileProfilePage />,
      },
      {
        path: 'loans',
        element: <MobileLoansPage />,
      },
      {
        path: 'funds-management',
        element: <FundsManagementPage />,
      },
      {
        path: 'diagnostics',
        element: <MobileDiagnosticsPage />,
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
        path: 'sfd-selector',
        element: <SfdSelectorPage />,
      },
      {
        path: 'sfd-adhesion/:sfdId',
        element: <SfdAdhesionPage />,
      },
    ],
  },
  
  // Error pages
  {
    path: '/unauthorized',
    element: <UnauthorizedPage />,
  },
  {
    path: '/access-denied',
    element: <UnauthorizedPage />,
  },
]);

export default router;
