
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MobileFlow from './pages/MobileFlow';
import AgencyDashboard from './pages/AgencyDashboard';
import ClientsPage from './pages/ClientsPage';
import LoansPage from './pages/LoansPage';

const App: React.FC = () => {
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
