
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import MobileLoansPage from '@/pages/mobile/MobileLoansPage';
import { Spinner } from '@/components/ui/spinner';
import SplashScreen from '@/components/mobile/SplashScreen';
import KYCVerification from '@/pages/KYCVerification';
import MobileNavigation from '@/components/MobileNavigation';
import HomeLoanPage from '@/components/mobile/loan/HomeLoanPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import MobileLoanApplicationPage from '@/pages/mobile/MobileLoanApplicationPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdConnectionPage from '@/pages/mobile/SfdConnectionPage';
import FundsManagementPage from '@/pages/mobile/FundsManagementPage';
import MobileLoanPlansPage from '@/pages/mobile/MobileLoanPlansPage';
import KycVerificationHistoryPage from '@/pages/KycVerificationHistoryPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';

// Export MobileRouter component to be used in MobileFlowPage
export const MobileRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<SplashScreen />} />
      <Route path="/main" element={<HomeLoanPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      <Route path="/sfd-selector" element={<SfdSelectorPage />} />
      <Route path="/sfd-connection" element={<SfdConnectionPage />} />
      <Route path="/funds-management" element={<FundsManagementPage />} />
      <Route path="/loan-plans" element={<MobileLoanPlansPage />} />
      <Route path="/loans" element={<MobileLoansPage />} />
      <Route path="/kyc" element={<KycVerificationHistoryPage />} />
      <Route path="/loan-application" element={<MobileLoanApplicationPage />} />
      <Route path="/loan-details/:loanId" element={<LoanDetailsPage />} />
      <Route path="*" element={<div>Mobile Page Not Found</div>} />
    </Routes>
  );
};

const Router = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Pages */}
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          
          {/* Permission Test Page */}
          <Route path="/permission-test" element={<PermissionTestPage />} />
          
          {/* Mobile Flow Routes */}
          <Route path="/mobile-flow/*" element={
            <div className="min-h-screen bg-white pb-16">
              <MobileRouter />
              <MobileNavigation />
            </div>
          } />
          
          {/* KYC Verification */}
          <Route path="/kyc" element={<KYCVerification />} />
          
          {/* Root and Catch-all */}
          <Route path="/" element={<Navigate to="/mobile-flow/loans" replace />} />
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
