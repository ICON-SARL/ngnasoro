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
import AuthRedirectPage from '@/pages/AuthRedirectPage';
import RoleGuard from '@/components/RoleGuard';
import { UserRole } from '@/hooks/auth/types';

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
                  <Route path="/login" element={<AuthRedirectPage />} />
                  <Route path="/auth" element={<AnonymousOnlyGuard><LoginPage /></AnonymousOnlyGuard>} />
                  <Route path="/admin/auth" element={<AnonymousOnlyGuard><AdminLoginPage /></AnonymousOnlyGuard>} />
                  <Route path="/client/auth" element={<AnonymousOnlyGuard><ClientLoginPage /></AnonymousOnlyGuard>} />
                  
                  {/* Admin Routes with Role Guards */}
                  <Route 
                    path="/super-admin-dashboard/*" 
                    element={
                      <AuthenticationGuard>
                        <RoleGuard requiredRole={UserRole.SuperAdmin}>
                          <SuperAdminDashboard />
                        </RoleGuard>
                      </AuthenticationGuard>
                    } 
                  />
                  
                  {/* Agency Routes with Role Guards */}
                  <Route 
                    path="/agency-dashboard/*" 
                    element={
                      <AuthenticationGuard>
                        <RoleGuard requiredRole={UserRole.SfdAdmin}>
                          <SuperAdminDashboard />
                        </RoleGuard>
                      </AuthenticationGuard>
                    } 
                  />
                  
                  {/* Mobile Flow Routes */}
                  <Route 
                    path="/mobile-flow/*" 
                    element={
                      <AuthenticationGuard>
                        <RoleGuard requiredRole={UserRole.Client}>
                          <MobileFlowPage />
                        </RoleGuard>
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
