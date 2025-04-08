
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate, useLocation } from 'react-router-dom';
import MobileFlow from './pages/MobileFlow';
import AgencyDashboard from './pages/AgencyDashboard';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import { useAuth } from './hooks/useAuth';
import AuthUI from './components/AuthUI';
import AdminAuthUI from './components/auth/AdminAuthUI';
import SfdAuthUI from './components/auth/SfdAuthUI';
import SuperAdminDashboard from './pages/SuperAdminDashboard';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    if (!loading) {
      if (user) {
        const userRole = user.app_metadata?.role;
        console.log('App detected user role:', userRole);
        
        // Only redirect if we're on the root path or auth paths
        const isAuthPath = location.pathname === '/' || 
                           location.pathname === '/auth' || 
                           location.pathname === '/admin/auth' ||
                           location.pathname === '/sfd/auth' ||
                           location.pathname === '/login';
        
        if (isAuthPath) {
          if (userRole === 'client') {
            navigate('/mobile-flow/main');
          } else if (userRole === 'admin') {
            navigate('/super-admin-dashboard');
          } else if (userRole === 'sfd_admin') {
            navigate('/agency-dashboard');
          } else {
            // Default case for other roles
            navigate('/mobile-flow/main');
          }
        }
      } else if (!loading && !user) {
        // Only redirect to auth if on protected paths
        const currentPath = location.pathname;
        const isProtectedPath = 
          !currentPath.includes('/auth') && 
          !currentPath.includes('/login') &&
          currentPath !== '/';
          
        if (isProtectedPath) {
          navigate('/auth');
        }
      }
    }
  }, [user, loading, navigate, location.pathname]);
  
  return (
    <Routes>
      <Route path="/auth" element={<AuthUI />} />
      <Route path="/login" element={<AuthUI />} />
      <Route path="/admin/auth" element={<AdminAuthUI />} />
      <Route path="/sfd/auth" element={<SfdAuthUI />} />
      <Route path="/mobile-flow/*" element={<MobileFlow />} />
      <Route path="/agency-dashboard" element={<AgencyDashboard />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/loans" element={<LoansPage />} />
      <Route path="/super-admin-dashboard" element={<SuperAdminDashboard />} />
      <Route path="*" element={<AuthUI />} />
    </Routes>
  );
};

export default App;
