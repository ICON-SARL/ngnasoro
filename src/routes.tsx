
import { createBrowserRouter, RouteObject } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PermissionTestPage from './pages/PermissionTestPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import SfdLoginPage from './pages/SfdLoginPage';
import AccountPage from './components/mobile/account/AccountPage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import { LoanActivityPage } from './pages/mobile/LoanActivityPage';
import ProfilePage from './components/mobile/profile/ProfilePage';
import SfdConnectionPage from './pages/mobile/SfdConnectionPage';
import MobileLoanPlansPage from './pages/mobile/MobileLoanPlansPage';
import MobileMyLoansPage from './pages/mobile/MobileMyLoansPage';
import SplashScreen from './components/mobile/SplashScreen';
import KycVerificationHistoryPage from './pages/KycVerificationHistoryPage';
import KYCVerification from './pages/KYCVerification';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import MobileLoansPage from './pages/mobile/MobileLoansPage';
import HomeLoanPage from './components/mobile/loan/HomeLoanPage';
import TransferPage from './pages/mobile/TransferPage';
import { SfdAdminLayout } from './components/sfd/SfdAdminLayout';

// Route principale avec layout racine App
const routes: RouteObject[] = [
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <SplashScreen onComplete={() => {}} />,
      },
      {
        path: 'auth',
        element: <LoginPage />,
      },
      {
        path: 'register',
        element: <RegisterPage />,
      },
      {
        path: 'access-denied',
        element: <AccessDeniedPage />,
      },
      {
        path: 'permission-test',
        element: <PermissionTestPage />,
      },
      {
        path: 'unauthorized',
        element: <UnauthorizedPage />,
      },
      {
        path: 'dashboard',
        element: <div>Dashboard Page</div>,
      },
      {
        path: 'admin',
        children: [
          {
            path: 'auth',
            element: <LoginPage isSfdAdmin={false} />,
          },
          {
            path: 'loan-plans',
            element: <div>Admin Loan Plans</div>,
          },
        ],
      },
      // Page d'authentification SFD - IMPORTANT: Pas dans la hiérarchie de l'App
      {
        path: 'sfd/auth',
        element: <SfdLoginPage />,
      },
    ],
  },
  // Routes pour l'administration SFD (nouveau layout)
  {
    path: '/agency-dashboard',
    element: <SfdAdminLayout><div>SFD Admin Dashboard</div></SfdAdminLayout>,
  },
  {
    path: '/sfd-loans',
    element: <SfdAdminLayout><div>SFD Loans Management</div></SfdAdminLayout>,
  },
  {
    path: '/sfd-clients',
    element: <SfdAdminLayout><div>SFD Clients Management</div></SfdAdminLayout>,
  },
  {
    path: '/sfd-adhesion-requests',
    element: <SfdAdminLayout><div>SFD Adhesion Requests</div></SfdAdminLayout>,
  },
  {
    path: '/sfd-transactions',
    element: <SfdAdminLayout><div>SFD Transactions</div></SfdAdminLayout>,
  },
  {
    path: '/sfd-subsidy-requests',
    element: <SfdAdminLayout><div>SFD Subsidy Requests</div></SfdAdminLayout>,
  },
  {
    path: '/sfd-settings',
    element: <SfdAdminLayout><div>SFD Settings</div></SfdAdminLayout>,
  },
  // Routes mobile
  {
    path: '/mobile-flow',
    element: <MobileFlowPage />,
    children: [
      {
        index: true,
        element: <AccountPage />,
      },
      {
        path: 'main',
        element: <AccountPage />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'loans',
        element: <HomeLoanPage />,
      },
      {
        path: 'funds-management',
        element: <div>Funds Management</div>,
      },
      {
        path: 'sfd-adhesion/:sfdId',
        element: <SfdAdhesionPage />,
      },
      {
        path: 'sfd-selector',
        element: <SfdSelectorPage />,
      },
      {
        path: 'sfd-connection',
        element: <SfdConnectionPage />,
      },
      {
        path: 'loan-activity',
        element: <LoanActivityPage />,
      },
      {
        path: 'loan-plans',
        element: <MobileLoanPlansPage />,
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
        element: <div>Loan Details</div>,
      },
      {
        path: 'my-loans',
        element: <MobileMyLoansPage />,
      },
      {
        path: 'kyc',
        element: <KycVerificationHistoryPage />,
      },
      {
        path: 'transfers',
        element: <TransferPage />,
      },
    ],
  },
  {
    path: '/kyc',
    element: <KYCVerification />,
  },
  {
    path: '*',
    element: <div>Page Not Found</div>,
  },
];

const router = createBrowserRouter(routes);

export default router;
