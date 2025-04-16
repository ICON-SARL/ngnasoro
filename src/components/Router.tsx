
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { UserRole } from '@/hooks/auth/types';
import SfdAdhesionPage from '@/pages/mobile/SfdAdhesionPage';
import SfdSelectorPage from '@/pages/SfdSelectorPage';
import { LoanActivityPage } from '@/pages/mobile/LoanActivityPage';
import ProfilePage from '@/components/mobile/profile/ProfilePage';
import SfdConnectionPage from '@/pages/mobile/SfdConnectionPage';
import FundsManagementPage from '@/pages/mobile/FundsManagementPage';
import LoanPlansPage from '@/pages/mobile/LoanPlansPage';

export const MobileRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Mobile Home</div>} />
      <Route path="/main" element={<div>Mobile Main</div>} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/loan-activity" element={<LoanActivityPage />} />
      <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      <Route path="/sfd-selector" element={<SfdSelectorPage />} />
      <Route path="/sfd-connection" element={<SfdConnectionPage />} />
      <Route path="/funds-management" element={<FundsManagementPage />} />
      <Route path="/loan-plans" element={<LoanPlansPage />} />
      <Route path="*" element={<div>Mobile Page Not Found</div>} />
    </Routes>
  );
};

const Router = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/access-denied" element={<AccessDeniedPage />} />
        <Route path="/permission-test" element={<PermissionTestPage />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default Router;
