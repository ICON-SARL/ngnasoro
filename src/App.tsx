
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MobileFlow from './pages/MobileFlow';
import AgencyDashboard from './pages/AgencyDashboard';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { useAuth } from './hooks/auth';

const App: React.FC = () => {
  const { isLoggedIn } = useAuth();

  return (
    <Routes>
      {/* Auth Routes */}
      <Route path="/auth" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/auth" element={<LoginPage />} />
      <Route path="/sfd/auth" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route path="/mobile-flow/*" element={<MobileFlow />} />
      <Route path="/agency-dashboard" element={<AgencyDashboard />} />
      <Route path="/clients" element={<ClientsPage />} />
      <Route path="/loans" element={<LoansPage />} />
      
      {/* Default route */}
      <Route path="*" element={isLoggedIn ? <AgencyDashboard /> : <LoginPage />} />
    </Routes>
  );
};

export default App;
