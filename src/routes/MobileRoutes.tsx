
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import MobileMainPage from '@/pages/MobileMainPage';
import SfdSetupPage from '@/pages/SfdSetupPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';

const MobileRoutes: React.FC = () => {
  return (
    <Routes>
      <Route 
        path="main" 
        element={<ProtectedRoute component={MobileMainPage} />} 
      />
      <Route 
        path="sfd-setup" 
        element={<ProtectedRoute component={SfdSetupPage} />} 
      />
      {/* Add other mobile routes here as needed */}
    </Routes>
  );
};

export default MobileRoutes;
