import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Pages
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import MobileFlowPage from '@/pages/MobileFlowPage';
import { CapacitorGuide } from '@/components/mobile/CapacitorGuide';

// Import your routes here

const Router = () => {
  const { user, isLoading } = useAuth();

  // If auth is still loading, don't render routes yet
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/capacitor-guide" element={<CapacitorGuide />} />
      
      {/* Mobile flow routes */}
      <Route path="/mobile-flow/*" element={<MobileFlowPage />} />
      
      {/* Redirect to mobile flow by default if logged in, otherwise to login */}
      <Route 
        path="/" 
        element={user ? <Navigate to="/mobile-flow/main" replace /> : <Navigate to="/login" replace />} 
      />
      
      {/* Not found route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default Router;
