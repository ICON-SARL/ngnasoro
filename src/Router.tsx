
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { AuthProvider } from '@/hooks/auth/AuthContext';

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
          
          {/* Catch-all route */}
          <Route path="*" element={<div>Page Not Found</div>} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
