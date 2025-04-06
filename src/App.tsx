
import React, { useState, useEffect } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Footer } from '@/components';
import AuthUI from '@/components/AuthUI';
import AdminAuthUI from '@/components/auth/AdminAuthUI';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';
import MobileFlow from '@/pages/MobileFlow';
import ClientsPage from '@/pages/ClientsPage';
import AccessDenied from '@/pages/AccessDeniedPage';
import PremiumDashboardPage from '@/pages/PremiumDashboard';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AgencyDashboard from '@/pages/AgencyDashboard';
import { AdminManagement } from '@/components/admin/AdminManagement';
import CreateSfdAdminPage from './pages/CreateSfdAdminPage';
import { useAuth } from '@/hooks/auth';

function App() {
  const { user, loading } = useAuth();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    // Check if biometric authentication is available (example)
    // In a real app, use a proper biometric library
    const checkBiometrics = () => {
      const hasBiometrics = typeof window !== 'undefined' && 
        (navigator.credentials !== undefined || 
         navigator.userAgent.includes('Biometric'));
      
      setIsBiometricAvailable(hasBiometrics);
    };
    
    checkBiometrics();
    
    // Log auth state on app startup
    console.log('App initialized, auth state:', { 
      isAuthenticated: !!user,
      userEmail: user?.email,
      userRole: user?.app_metadata?.role,
      loading
    });
  }, [user, loading]);

  // Render loading state if auth is still being checked
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0D6A51]"></div>
        <span className="ml-3">Chargement de l'application...</span>
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthUI />} />
        <Route path="/admin/auth" element={<AdminAuthUI />} />
        <Route path="/sfd/auth" element={<SfdAuthUI />} />
        <Route path="/access-denied" element={<AccessDenied />} />
        
        {/* Regular user routes */}
        <Route path="/mobile-flow/*" element={
          <ProtectedRoute component={MobileFlow} />
        } />
        
        {/* Admin Routes - require admin role */}
        <Route path="/super-admin-dashboard" element={
          <ProtectedRoute requireAdmin={true} component={SuperAdminDashboard} />
        } />
        <Route path="/admin/management" element={
          <ProtectedRoute requireAdmin={true} component={AdminManagement} />
        } />
        <Route path="/admin/create-sfd-admin" element={
          <ProtectedRoute requireAdmin={true} component={CreateSfdAdminPage} />
        } />
        
        {/* SFD Admin Routes - require sfd_admin role */}
        <Route path="/agency-dashboard" element={
          <ProtectedRoute requireSfdAdmin={true} component={AgencyDashboard} />
        } />
        <Route path="/clients" element={
          <ProtectedRoute requireSfdAdmin={true} component={ClientsPage} />
        } />
        
        {/* Premium Routes */}
        <Route path="/premium-dashboard" element={<PremiumDashboardPage />} />
      </Routes>
    </>
  );
}

export default App;
