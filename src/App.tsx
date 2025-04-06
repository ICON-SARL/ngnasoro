import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthUI, PremiumDashboardPage, AccessDenied, MobileFlow, ClientsPage, ProtectedRoute, PermissionProtectedRoute, AdminAuthUI, SfdAuthUI } from '@/components';
import { useAuth } from '@/hooks/auth';
import { SuperAdminDashboard } from '@/components/SuperAdminDashboard';
import { AgencyDashboard } from '@/components/AgencyDashboard';
import { AdminManagement } from '@/components/admin/AdminManagement';
import { UserManagement } from '@/components/UserManagement';
import CreateSfdAdminPage from './pages/CreateSfdAdminPage';

function App() {
  const { user, loading, session } = useAuth();
  const [isBiometricAvailable, setIsBiometricAvailable] = useState(false);

  useEffect(() => {
    // Check if biometric authentication is available (example)
    // In a real app, use a proper biometric library
    setIsBiometricAvailable(typeof window !== 'undefined' && (navigator.credentials || navigator.userAgent.includes('Biometric')));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/mobile-flow" />} />
        <Route path="/auth" element={<AuthUI />} />
        <Route path="/admin/auth" element={<AdminAuthUI />} />
        <Route path="/sfd/auth" element={<SfdAuthUI />} />
        <Route path="/mobile-flow" element={<MobileFlow />} />
        
        {/* Admin Routes */}
        <Route path="/super-admin-dashboard" element={
          <ProtectedRoute requireAdmin={true} component={SuperAdminDashboard} />
        } />
        <Route path="/admin/management" element={
          <ProtectedRoute requireAdmin={true} component={AdminManagement} />
        } />
        <Route path="/admin/create-sfd-admin" element={<CreateSfdAdminPage />} />
        
        {/* SFD Admin Routes */}
        <Route path="/agency-dashboard" element={
          <ProtectedRoute requireSfdAdmin={true} component={AgencyDashboard} />
        } />
        <Route path="/clients" element={<ClientsPage />} />
        
        {/* Premium Routes */}
        <Route path="/premium-dashboard" element={<PremiumDashboardPage />} />
        
        {/* Access Denied Route */}
        <Route path="/access-denied" element={<AccessDenied />} />
      </Routes>
    </Router>
  );
}

export default App;
