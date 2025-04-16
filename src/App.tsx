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
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import RoleGuard from '@/components/RoleGuard';
import AnonymousOnlyGuard from '@/components/AnonymousOnlyGuard';
import { UserRole } from '@/utils/auth/roleTypes';
import SfdManagementPage from '@/pages/admin/SfdManagementPage';
import AgencyManagementPage from '@/pages/admin/AgencyManagementPage';
import LoansPage from '@/pages/LoansPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdAdhesionRequestsPage from '@/pages/SfdAdhesionRequestsPage';
import SfdTransactionsPage from '@/pages/SfdTransactionsPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SfdAdminDashboard from '@/components/sfd/SfdAdminDashboard';

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
                  {/* Public Routes - Redirect based on auth state */}
                  <Route 
                    path="/" 
                    element={
                      <AnonymousOnlyGuard>
                        <Navigate to="/auth" replace />
                      </AnonymousOnlyGuard>
                    } 
                  />
                  
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
                  
                  <Route
                    path="/sfd/auth"
                    element={
                      <AnonymousOnlyGuard>
                        <LoginPage isSfdAdmin={true} />
                      </AnonymousOnlyGuard>
                    }
                  />
                  
                  {/* Access Denied Page */}
                  <Route path="/access-denied" element={<AccessDeniedPage />} />
                  
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
                    path="/agency-dashboard"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <SfdAdminDashboard />
                      </RoleGuard>
                    }
                  />
                  
                  <Route
                    path="/sfd-loans"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <LoansPage />
                      </RoleGuard>
                    }
                  />
                  
                  <Route
                    path="/sfd-clients"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <SfdClientsPage />
                      </RoleGuard>
                    }
                  />
                  
                  <Route
                    path="/sfd-adhesion-requests"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <SfdAdhesionRequestsPage />
                      </RoleGuard>
                    }
                  />
                  
                  <Route
                    path="/sfd-transactions"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <SfdTransactionsPage />
                      </RoleGuard>
                    }
                  />
                  
                  <Route
                    path="/sfd-subsidy-requests"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <SfdSubsidyRequestsPage />
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
                  
                  {/* Protected Profile Route */}
                  <Route
                    path="/profile"
                    element={
                      <RoleGuard requiredRole={UserRole.CLIENT}>
                        <ProfilePage />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Agency Management Route */}
                  <Route
                    path="/agency-management"
                    element={
                      <RoleGuard requiredRole={UserRole.SFD_ADMIN}>
                        <AgencyManagementPage />
                      </RoleGuard>
                    }
                  />
                  
                  {/* Catch-all route - Redirect to appropriate auth page */}
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
