
import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { MobileRouter } from './components/Router';
import { Outlet } from 'react-router-dom';
import MobileFlowPage from './pages/mobile/MobileFlowPage';
import FundsManagementPage from './pages/mobile/FundsManagementPage';
import MobileDiagnosticsPage from './pages/mobile/MobileDiagnosticsPage';
import MobileLoanApplicationPage from './pages/mobile/MobileLoanApplicationPage';
import LoanDetailsPage from './pages/mobile/LoanDetailsPage';
import SfdLoansPage from './pages/SfdLoansPage';
import LoansPage from './pages/LoansPage';

const router = createBrowserRouter([
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
      // SFD routes
      {
        path: 'sfd-loans',
        element: <SfdLoansPage />,
      },
      {
        path: 'loans',
        element: <LoansPage />,
      },
    ],
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
        path: 'loan-plans',
        element: <div>Loan Plans Mobile View</div>,
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
