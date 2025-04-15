
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import RoleGuard from '@/components/RoleGuard';
import AnonymousOnlyGuard from '@/components/AnonymousOnlyGuard';
import { UserRole } from '@/utils/auth/roleTypes';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
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
                  {/* Public Routes - Redirect to appropriate auth page */}
                  <Route path="/" element={<Navigate to="/auth" replace />} />
                  
                  {/* Auth Routes - Only accessible when not authenticated */}
                  <Route
                    path="/auth"
                    element={
                      <AnonymousOnlyGuard>
                        <ClientLoginPage />
                      </AnonymousOnlyGuard>
                    }
                  />
                  <Route
                    path="/admin/auth"
                    element={
                      <AnonymousOnlyGuard>
                        <AdminLoginPage />
                      </AnonymousOnlyGuard>
                    }
                  />
                  
                  {/* Super Admin Routes */}
                  <Route
                    path="/super-admin-dashboard/*"
                    element={
                      <RoleGuard requiredRole={UserRole.SUPER_ADMIN}>
                        <SuperAdminDashboard />
                      </RoleGuard>
                    }
                  />
                  
                  {/* SFD Admin Routes */}
                  <Route
                    path="/agency-dashboard/*"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <SfdManagementPage />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Client Routes */}
                  <Route
                    path="/mobile-flow/*"
                    element={
                      <RoleGuard requiredRole={UserRole.CLIENT}>
                        <MobileFlowPage />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Protected Routes - Accessible by any authenticated user */}
                  <Route
                    path="/profile"
                    element={
                      <RoleGuard requiredRole={UserRole.CLIENT}>
                        <ProfilePage />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Catch-all route - Redirect to appropriate dashboard based on role */}
                  <Route
                    path="*"
                    element={
                      <Navigate to="/auth" replace />
                    }
                  />
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
