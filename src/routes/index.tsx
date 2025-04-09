
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MobileFlowPage from '@/pages/MobileFlowPage';
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/hooks/auth/AuthContext';

const AppRoutes = () => {
  const { loading } = useAuth();
  
  // Show loading state while authentication is being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0D6A51]"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes accessible to all users */}
      <Route path="/auth" element={<LoginPage />} />
      
      {/* Mobile application flow */}
      <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
      
      {/* Redirect root to mobile flow */}
      <Route path="/" element={<Navigate to="/mobile-flow" replace />} />
      
      {/* Catch all for 404s */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
