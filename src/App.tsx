
import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import './App.css';
import AuthUI from './components/AuthUI';
import MobileFlow from './pages/MobileFlow';
import MobileRoutes from './routes/MobileRoutes';
import AdminLoginPage from './pages/AdminLoginPage';
import ClientLoginPage from './pages/ClientLoginPage';
import SfdLoginPage from './pages/SfdLoginPage';

// Lazy loaded components for better performance
const AdminDashboard = React.lazy(() => import('./pages/AdminDashboard'));
const AgencyDashboard = React.lazy(() => import('./pages/AgencyDashboard'));
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const AccessDeniedPage = React.lazy(() => import('./pages/AccessDeniedPage'));

function App() {
  return (
    <div className="App">
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<ClientLoginPage />} />
          <Route path="/admin/auth" element={<AdminLoginPage />} />
          <Route path="/sfd/auth" element={<AdminLoginPage isSfdAdmin={true} />} />
          <Route path="/mobile-flow/*" element={<MobileFlow />} />
          <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
          <Route path="/agency-dashboard/*" element={<AgencyDashboard />} />
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Routes>
      </Suspense>
      <Toaster />
    </div>
  );
}

export default App;
