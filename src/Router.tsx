
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '@/pages/LoginPage';
import AdminLoginPage from '@/pages/AdminLoginPage';
import SfdLoginPage from '@/pages/SfdLoginPage';
import AuthSelectorPage from '@/pages/AuthSelectorPage';
import RegisterPage from '@/pages/RegisterPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import PermissionTestPage from '@/pages/PermissionTestPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import UltraSplashScreen from '@/components/mobile/UltraSplashScreen';

const Router = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    if (hasSeenSplash) {
      setShowSplash(false);
    }
  }, []);

  const handleSplashComplete = () => {
    sessionStorage.setItem('hasSeenSplash', 'true');
    setShowSplash(false);
  };

  if (showSplash) {
    return <UltraSplashScreen onComplete={handleSplashComplete} />;
  }

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Auth Pages */}
          <Route path="/" element={<AuthSelectorPage />} />
          <Route path="/auth-selector" element={<AuthSelectorPage />} />
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/admin/auth" element={<AdminLoginPage />} />
          <Route path="/sfd/auth" element={<SfdLoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
          
          {/* Permission Test Page */}
          <Route path="/permission-test" element={<PermissionTestPage />} />
          
          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/auth-selector" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Router;
