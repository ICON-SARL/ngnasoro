import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import MobileFlow from './pages/MobileFlow';
import KYCVerification from './pages/KYCVerification';
import MultiSFDDashboard from './pages/MultiSFDDashboard';
import AgencyDashboard from './pages/AgencyDashboard';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import InfrastructurePage from './pages/InfrastructurePage';
import PremiumDashboard from './pages/PremiumDashboard';
import SupportPage from './pages/SupportPage';
import SolvencyEngine from './pages/SolvencyEngine';
import NotFound from './pages/NotFound';
import LoanSystemPage from "./pages/LoanSystemPage";

function App() {
  return (
    <div className="App">
      {/* Routes définition */}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/mobile-flow" element={<MobileFlow />} />
        <Route path="/kyc-verification" element={<KYCVerification />} />
        <Route path="/multi-sfd" element={<MultiSFDDashboard />} />
        <Route path="/agency" element={<AgencyDashboard />} />
        <Route path="/super-admin" element={<SuperAdminDashboard />} />
        <Route path="/infra" element={<InfrastructurePage />} />
        <Route path="/premium" element={<PremiumDashboard />} />
        <Route path="/support" element={<SupportPage />} />
        <Route path="/solvency" element={<SolvencyEngine />} />
        <Route path="/loan-system" element={<LoanSystemPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
