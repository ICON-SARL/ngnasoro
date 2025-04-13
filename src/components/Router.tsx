
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Pages
import LoginPage from '@/pages/LoginPage';
import NotFound from '@/pages/NotFound';
import MobileFlowPage from '@/pages/MobileFlowPage';
import { CapacitorGuide } from '@/components/mobile/CapacitorGuide';
import TestAuth from '@/components/auth/TestAuth';

// Create a client for the mobile router with longer staleTime
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 secondes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const MobileRouter = () => {
  const { user, loading } = useAuth();

  // If auth is still loading, don't render routes yet
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/capacitor-guide" element={<CapacitorGuide />} />
        <Route path="/test-auth" element={<TestAuth />} />
        
        {/* Mobile flow routes - Important: These routes are relative to the parent route */}
        <Route path="/*" element={<MobileFlowPage />} />
        
        {/* Redirect to mobile flow by default if logged in, otherwise to login */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/mobile-flow/main" replace /> : <Navigate to="/login" replace />} 
        />
        
        {/* Not found route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </QueryClientProvider>
  );
};
