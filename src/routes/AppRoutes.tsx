
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AuthUI from '@/components/AuthUI';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import MobileRoutes from './MobileRoutes';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="auth" element={<ClientLoginPage />} />
      <Route path="admin/auth" element={<AdminLoginPage />} />
      <Route path="sfd/auth" element={<AdminLoginPage isSfdAdmin={true} />} />
      
      {/* Mobile Flow routes */}
      <Route path="mobile-flow/*" element={<MobileRoutes />} />
      
      {/* Redirect root to appropriate location */}
      <Route path="/" element={<Navigate to="/auth" replace />} />
      
      {/* Catch all unknown routes */}
      <Route path="*" element={<Navigate to="/auth" replace />} />
    </Routes>
  );
};

export default AppRoutes;
