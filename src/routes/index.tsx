
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import MobileFlow from '@/components/mobile/MobileFlow';
import FundsManagementPage from '@/components/mobile/funds-management/FundsManagementPage';
import SecurePaymentPage from '@/components/mobile/secure-payment/SecurePaymentPage';
import AdminRoutes from './AdminRoutes';
import SfdRoutes from './SfdRoutes';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<LoginPage />} />
        <Route path="/client/auth" element={<ClientLoginPage />} />
        
        {/* Mobile app flow */}
        <Route path="/mobile-flow/*" element={<MobileFlow />} />
        <Route path="/mobile-flow/funds" element={<FundsManagementPage />} />
        <Route path="/mobile-flow/secure-payment" element={<SecurePaymentPage />} />
        
        {/* Admin routes */}
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/super-admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/sfd-management" element={<Navigate to="/admin/sfd-management" replace />} />
        
        {/* SFD Admin routes */}
        <Route path="/sfd/*" element={<SfdRoutes />} />
        <Route path="/agency-dashboard" element={<Navigate to="/sfd/dashboard" replace />} />
        
        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
