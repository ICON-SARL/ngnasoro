
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccessDeniedPage from './pages/AccessDeniedPage';
import PermissionTestPage from './pages/PermissionTestPage';
import KYCVerification from './pages/KYCVerification';
import KycVerificationHistoryPage from './pages/KycVerificationHistoryPage';
import { LoanActivityPage } from './pages/mobile/LoanActivityPage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileLoanPlansPage from './pages/mobile/MobileLoanPlansPage';
import MobileMyLoansPage from './pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import SplashScreen from './components/mobile/SplashScreen';
import ProfilePage from './components/mobile/profile/ProfilePage';
import SfdAdhesionPage from './pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from './pages/SfdSelectorPage';
import SfdConnectionPage from './pages/mobile/SfdConnectionPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import TransferPage from './pages/mobile/TransferPage';
import { Outlet } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <SplashScreen />,
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
        path: 'kyc',
        element: <KYCVerification />,
      }
    ],
  },
  // Mobile routes
  {
    path: '/mobile-flow',
    element: <Outlet />,
    children: [
      {
        path: 'dashboard',
        element: <SplashScreen />,
      },
      {
        path: 'profile',
        element: <ProfilePage />,
      },
      {
        path: 'loans',
        element: <MobileMyLoansPage />,
      },
      {
        path: 'transactions',
        element: <FundsManagementPage />,
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
        path: 'loan-activity',
        element: <LoanActivityPage />,
      },
      {
        path: 'sfd-adhesion/:sfdId',
        element: <SfdAdhesionPage />
      },
      {
        path: 'sfd-selector',
        element: <SfdSelectorPage />
      },
      {
        path: 'sfd-connection',
        element: <SfdConnectionPage />
      },
      {
        path: 'funds-management',
        element: <FundsManagementPage />
      },
      {
        path: 'loan-plans',
        element: <MobileLoanPlansPage />
      },
      {
        path: 'transfer',
        element: <TransferPage />
      },
      {
        path: 'diagnostics',
        element: <KycVerificationHistoryPage />,
      }
    ],
  }
]);

export default router;
