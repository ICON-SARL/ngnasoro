
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import AuthenticationGuard from '@/components/AuthenticationGuard';
import AnonymousOnlyGuard from '@/components/AnonymousOnlyGuard';
import { AuthProvider } from '@/hooks/auth/AuthContext';
import LoginPage from '@/pages/LoginPage';
import ProfilePage from '@/pages/ProfilePage';
import MobileFlowPage from '@/pages/MobileFlowPage';
import SuperAdminDashboard from '@/pages/SuperAdminDashboard';
import AdminLoginPage from '@/pages/AdminLoginPage';
import ClientLoginPage from '@/pages/ClientLoginPage';

function App() {
  return (
    <React.StrictMode>
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
    </React.StrictMode>
  );
}

export default App;
