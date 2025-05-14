
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

// Instead of exporting a router component, export the routes as an array
// that can be included in the main router
export const mobileRoutes = (
  <Routes>
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
    <Route 
      path="/my-loans" 
      element={<MobileMyLoansPage />} 
    />
    <Route 
      path="/loan-details/:loanId" 
      element={<LoanDetailsPage />} 
    />
    <Route path="*" element={<div>Mobile Page Not Found</div>} />
  </Routes>
);

// This is now a simple component that renders routes, not a router
export const MobileRouter = () => mobileRoutes;

// We no longer need a separate Router component since we're using the router from routes.tsx
const Router = () => {
  return mobileRoutes;
};

export default Router;
