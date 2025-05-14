
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { UserRole } from '@/utils/auth/roleTypes';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import { LoanActivityPage } from '@/pages/mobile/LoanActivityPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdConnectionPage from '@/pages/mobile/SfdConnectionPage';
import FundsManagementPage from '@/pages/mobile/FundsManagementPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import SplashScreen from '@/components/mobile/SplashScreen';
import KycVerificationHistoryPage from '@/pages/KycVerificationHistoryPage';
import KYCVerification from '@/pages/KYCVerification';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import HomeLoanPage from '@/components/mobile/loan/HomeLoanPage';

// Export the routes as an array of route elements
export const authRoutes = (
  <>
    <Route path="/auth" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/access-denied" element={<AccessDeniedPage />} />
    <Route path="/permission-test" element={<PermissionTestPage />} />
  </>
);

export const mobileRoutes = (
  <>
    <Route path="/" element={<SplashScreen />} />
    <Route path="/main" element={<div>Mobile Main</div>} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/loan-activity" element={<LoanActivityPage />} />
    <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
    <Route path="/sfd-selector" element={<SfdSelectorPage />} />
    <Route path="/sfd-connection" element={<SfdConnectionPage />} />
    <Route path="/funds-management" element={<FundsManagementPage />} />
    <Route path="/loan-plans" element={<MobileLoanPlansPage />} />
    <Route path="/loans" element={<HomeLoanPage />} />
    <Route path="/kyc" element={<KycVerificationHistoryPage />} />
    <Route path="/loan-application" element={<MobileLoanApplicationPage />} />
    <Route path="/my-loans" element={<MobileMyLoansPage />} />
    <Route path="/loan-details/:loanId" element={<LoanDetailsPage />} />
    <Route path="*" element={<div>Mobile Page Not Found</div>} />
  </>
);

// This component is now just a collection of routes, not a router
const Router = () => {
  return (
    <Routes>
      {authRoutes}
      <Route path="*" element={<div>Page Not Found</div>} />
    </Routes>
  );
};

export default Router;
