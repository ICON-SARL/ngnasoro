
import React, { useEffect } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import MobileFlow from './pages/MobileFlow';
import AgencyDashboard from './pages/AgencyDashboard';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import { useAuth } from './hooks/auth/AuthContext';

const App: React.FC = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading && user) {
      const userRole = user.app_metadata?.role;
      console.log('App detected user role:', userRole);
      
      // Redirect based on user role if needed
      if (userRole === 'client' && window.location.pathname === '/') {
        navigate('/mobile-flow/main');
      } else if (userRole === 'admin' && window.location.pathname === '/') {
        navigate('/super-admin-dashboard');
      } else if (userRole === 'sfd_admin' && window.location.pathname === '/') {
        navigate('/agency-dashboard');
      }
    }
  }, [user, loading, navigate]);
  
  return (
    <Routes>
      <Route path="/mobile-flow/*" element={<MobileFlow />} />
      <Route path="/agency-dashboard" element={<AgencyDashboard />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/loans" element={<LoansPage />} />
      <Route path="*" element={<AgencyDashboard />} />
    </Routes>
  );
};

export default App;
