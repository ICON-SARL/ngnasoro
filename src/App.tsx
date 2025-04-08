
import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/hooks/use-toast';
import { AuthProvider, useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/hooks/auth/types';

// Pages
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import SfdAdminDashboard from '@/components/admin/SfdAdminDashboard';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdStatsPage from '@/pages/SfdStatsPage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import ProfilePage from '@/pages/ProfilePage';
import SfdAdminListPage from '@/pages/SfdAdminListPage';
import SfdManagementPage from '@/pages/SfdManagementPage';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import CreditApprovalPage from '@/pages/CreditApprovalPage';
import AuditLogsPage from '@/pages/AuditLogsPage';
import NotFoundPage from '@/pages/NotFoundPage';
import ClientLoginPage from '@/pages/ClientLoginPage';
import MultiSFDDashboard from '@/pages/MultiSFDDashboard';
import SfdLoginPage from '@/pages/SfdLoginPage';
import SfdSubsidyRequestsPage from '@/pages/SfdSubsidyRequestsPage';
import SubsidyRequestDetailPage from '@/pages/SubsidyRequestDetailPage';
import SolvencyEnginePage from '@/pages/SolvencyEnginePage';
import SfdLoansPage from '@/pages/SfdLoansPage';

function AppContent() {
  const { user, loading, isAdmin, isSfdAdmin } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  
  useEffect(() => {
    // Show a toast when the user logs in
    if (user && location.pathname === '/') {
      const displayName = user.displayName || user.email;
      toast({
        title: `Bienvenue, ${displayName}!`,
        description: "Vous êtes connecté avec succès."
      });
    }
  }, [user, location.pathname, toast]);
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }
  
  // Redirect to appropriate dashboard based on role
  const determineRedirect = () => {
    if (!user) return '/client-login';
    
    const role = user?.role;
    
    switch(role) {
      case UserRole.SUPER_ADMIN:
        return '/super-admin-dashboard';
      case UserRole.SFD_ADMIN:
        return '/sfd-dashboard';
      default:
        return '/client-dashboard';
    }
  };
  
  return (
    <Routes>
      {/* Redirect from root based on role */}
      <Route path="/" element={<Navigate to={determineRedirect()} replace />} />
      
      {/* Auth routes */}
      <Route path="/client-login" element={<ClientLoginPage />} />
      <Route path="/sfd-login" element={<SfdLoginPage />} />
      
      {/* Super Admin routes */}
      <Route 
        path="/super-admin-dashboard" 
        element={
          isAdmin ? 
          <SuperAdminDashboard /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/admin-list" 
        element={
          isAdmin ? 
          <SfdAdminListPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/sfd-management" 
        element={
          isAdmin ? 
          <SfdManagementPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/credit-approval" 
        element={
          isAdmin ? 
          <CreditApprovalPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/audit-logs" 
        element={
          isAdmin ? 
          <AuditLogsPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      
      {/* SFD Admin routes */}
      <Route 
        path="/sfd-dashboard" 
        element={
          isSfdAdmin ? 
          <SfdAdminDashboard /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/sfd-clients" 
        element={
          isSfdAdmin ? 
          <SfdClientsPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/sfd-stats" 
        element={
          isSfdAdmin ? 
          <SfdStatsPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/sfd-loans" 
        element={
          isSfdAdmin ? 
          <SfdLoansPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/sfd-subsidy-requests" 
        element={
          isSfdAdmin ? 
          <SfdSubsidyRequestsPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      <Route 
        path="/sfd-subsidy-requests/:requestId" 
        element={
          isSfdAdmin ? 
          <SubsidyRequestDetailPage /> : 
          <Navigate to={user ? "/access-denied" : "/sfd-login"} replace />
        } 
      />
      
      {/* Client routes */}
      <Route 
        path="/client-dashboard" 
        element={
          user && user.role === UserRole.USER ? 
          <MobileFlowPage /> : 
          <Navigate to={user ? "/access-denied" : "/client-login"} replace />
        } 
      />
      <Route 
        path="/multi-sfd-dashboard" 
        element={
          user && user.role === UserRole.USER ? 
          <MultiSFDDashboard /> : 
          <Navigate to={user ? "/access-denied" : "/client-login"} replace />
        } 
      />
      <Route 
        path="/solvency-engine" 
        element={
          user && user.role === UserRole.USER ? 
          <SolvencyEnginePage /> : 
          <Navigate to={user ? "/access-denied" : "/client-login"} replace />
        } 
      />
      
      {/* Shared routes */}
      <Route 
        path="/profile" 
        element={user ? <ProfilePage /> : <Navigate to="/" replace />} 
      />
      
      {/* Error pages */}
      <Route path="/access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <Toaster />
    </AuthProvider>
  );
}

export default App;
