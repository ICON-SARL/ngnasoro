
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';

// Instead of creating a BrowserRouter here, we'll just export Routes and Route components
// that can be included in the main routes configuration
const Router = () => {
  return (
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
  );
};

export default Router;
