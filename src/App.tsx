
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthenticationGuard from '@/components/AuthenticationGuard';
import AnonymousOnlyGuard from '@/components/AnonymousOnlyGuard';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: true,
      retry: 1,
    },
  },
});

function App() {
  return (
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="flex flex-col min-h-screen">
              <div className="flex-grow">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  <Route path="/auth" element={<LoginPage />} />
                  <Route path="/admin/auth" element={<AdminLoginPage />} />
                  <Route path="/client/auth" element={<ClientLoginPage />} />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/super-admin-dashboard/*" 
                    element={
                      <AuthenticationGuard>
                        <SuperAdminDashboard />
                      </AuthenticationGuard>
                    } 
                  />
                  
                  {/* Mobile Flow Routes */}
                  <Route 
                    path="/mobile-flow/*" 
                    element={
                      <AuthenticationGuard>
                        <MobileFlowPage />
                      </AuthenticationGuard>
                    } 
                  />
                  
                  {/* Profile Page */}
                  <Route 
                    path="/profile" 
                    element={
                      <AuthenticationGuard>
                        <ProfilePage />
                      </AuthenticationGuard>
                    } 
                  />
                  
                  {/* Fallback Route */}
                  <Route path="*" element={<Navigate to="/auth" replace />} />
                </Routes>
                <Toaster />
              </div>
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </React.StrictMode>
  );
}

export default App;
