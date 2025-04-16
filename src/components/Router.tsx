
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
import { LoanApplicationForm } from '@/components/loan/LoanApplicationForm';

export const MobileRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<div>Mobile Home</div>} />
      <Route path="/main" element={<div>Mobile Main</div>} />
      <Route path="/loan-activity" element={<div>Loan Activity</div>} />
      <Route path="/loan-application/:sfdId" element={<LoanApplicationForm />} />
      <Route path="/sfd-adhesion/:sfdId" element={<SfdAdhesionPage />} />
      <Route path="/sfd-selector" element={<SfdSelectorPage />} />
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
