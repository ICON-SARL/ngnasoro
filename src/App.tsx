
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import { LoanActivityPage } from '@/pages/mobile/LoanActivityPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdConnectionPage from '@/pages/mobile/SfdConnectionPage';
import FundsManagementPage from '@/pages/mobile/FundsManagementPage';
import LoanPlansPage from '@/pages/mobile/LoanPlansPage';
import MobileMyLoansPage from '@/pages/mobile/MobileMyLoansPage';
import LoanDetailsPage from '@/pages/mobile/LoanDetailsPage';
import SplashScreen from '@/components/mobile/SplashScreen';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Routes */}
          <Route path="/" element={<SplashScreen />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          <Route path="/permission-test" element={<PermissionTestPage />} />
          
          {/* Mobile Flow Routes */}
          <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
          
          {/* Direct Mobile Routes */}
          <Route path="/sfd-selector" element={<SfdSelectorPage />} />
          <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
          <Route path="/sfd-connection" element={<SfdConnectionPage />} />
          <Route path="/loan-activity" element={<LoanActivityPage />} />
          <Route path="/funds-management" element={<FundsManagementPage />} />
          <Route path="/loan-plans" element={<LoanPlansPage />} />
          <Route path="/my-loans" element={<MobileMyLoansPage />} />
          <Route path="/loan-details/:loanId" element={<LoanDetailsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Catch all route */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
