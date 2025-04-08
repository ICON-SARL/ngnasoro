
import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import MobileFlow from './pages/MobileFlow';
import AgencyDashboard from './pages/AgencyDashboard';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';
import { useAuth } from './hooks/auth/AuthContext';
import AuthUI from './components/AuthUI';

const App: React.FC = () => {
  const { isLoggedIn, isLoading, user } = useAuth();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
        <span className="ml-3">Chargement...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth" element={isLoggedIn ? <Navigate to="/" replace /> : <AuthUI />} />
      
      {/* Protected routes */}
      <Route 
        path="/mobile-flow/*" 
        element={isLoggedIn ? <MobileFlow /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/agency-dashboard" 
        element={isLoggedIn ? <AgencyDashboard /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/clients" 
        element={isLoggedIn ? <ClientsPage /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/loans" 
        element={isLoggedIn ? <LoansPage /> : <Navigate to="/auth" replace />} 
      />
      
      {/* Default route */}
      <Route path="/" element={
        isLoggedIn ? 
          (user?.app_metadata?.role === 'sfd_admin' ? 
            <Navigate to="/agency-dashboard" replace /> : 
            <Navigate to="/mobile-flow" replace />
          ) : 
          <Navigate to="/auth" replace />
      } />
      
      {/* Fallback route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
