import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import SfdPage from './pages/SfdPage';
import SfdUsersPage from './pages/SfdUsersPage';
import SfdLoansPage from './pages/SfdLoansPage';
import SfdClientsPage from './pages/SfdClientsPage';
import SfdClientDetailsPage from './pages/SfdClientDetailsPage';
import SfdLoanDetailsPage from './pages/SfdLoanDetailsPage';
import AdminLoanPlansPage from './pages/AdminLoanPlansPage';
import MobileDashboardPage from './pages/mobile/MobileDashboardPage';
import MobileProfilePage from './pages/mobile/MobileProfilePage';
import MobileLoansPage from './pages/mobile/MyLoansPage';
import MobileTransactionsPage from './pages/mobile/MobileTransactionsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import MobileLoanDetailsPage from './pages/mobile/MobileLoanDetailsPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import LoanApplicationPage from './pages/LoanApplicationPage';
import { Outlet } from 'react-router-dom';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'auth',
        element: <AuthPage />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'admin',
        children: [
          {
            path: 'loan-plans',
            element: <AdminLoanPlansPage />,
          },
        ],
      },
    ],
  },
  // Mobile routes
  {
    path: '/mobile-flow',
    element: <Outlet />,
    children: [
      {
        path: 'dashboard',
        element: <MobileDashboardPage />,
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
        path: 'transactions',
        element: <MobileTransactionsPage />,
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
        element: <MobileLoanDetailsPage />,
      },
      {
        path: 'diagnostics',
        element: <MobileDiagnosticsPage />,
      }
    ],
  },
  // Other SFD routes
  {
    path: '/sfd',
    element: <SfdPage />,
    children: [
      {
        path: 'users',
        element: <SfdUsersPage />,
      },
      {
        path: 'loans',
        element: <SfdLoansPage />,
      },
      {
        path: 'loans/:loanId',
        element: <SfdLoanDetailsPage />,
      },
      {
        path: 'clients',
        element: <SfdClientsPage />,
      },
      {
        path: 'clients/:clientId',
        element: <SfdClientDetailsPage />,
      },
    ],
  },
  // Standalone pages
  {
    path: '/loan-application',
    element: <LoanApplicationPage />,
  }
]);

export default router;
