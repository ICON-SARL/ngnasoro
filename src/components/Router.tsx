
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import RoleGuard from '@/components/RoleGuard';
import KycVerificationHistoryPage from '@/pages/KycVerificationHistoryPage';
import KYCVerification from '@/pages/KYCVerification';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import HomeLoanPage from '@/components/mobile/loan/HomeLoanPage';

export const MobileRouter = () => {
  return (
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
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/permission-test" element={<PermissionTestPage />} />
        <Route path="/kyc" element={<KYCVerification />} />
        <Route path="/mobile-flow/*" element={<MobileRouter />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
