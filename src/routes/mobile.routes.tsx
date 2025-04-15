
import { RouteObject } from 'react-router-dom';
import MobileLoansListPage from '@/pages/mobile/MobileLoansListPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoanDetailsPage from '@/pages/mobile/MobileLoanDetailsPage';
import TransferPage from '@/pages/mobile/TransferPage';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';

export const mobileRoutes: RouteObject[] = [
  {
    path: '/mobile-flow/my-loans',
    element: <MobileLoansListPage />
  },
  {
    path: '/mobile-flow/loans',
    element: <MobileLoansPage />
  },
  {
    path: '/mobile-flow/loan-plans',
    element: <MobileLoanPlansPage />
  },
  {
    path: '/mobile-flow/loan-application',
    element: <MobileLoanApplicationPage />
  },
  {
    path: '/mobile-flow/loan-details/:id',
    element: <MobileLoanDetailsPage />
  },
  {
    path: '/mobile-flow/transfer',
    element: <TransferPage />
  },
  {
    path: '/mobile-flow/funds',
    element: <FundsManagementPage />
  }
];
