
import { RouteObject } from 'react-router-dom';
import MobileLoansListPage from '@/pages/mobile/MobileLoansListPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';

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
  }
];
