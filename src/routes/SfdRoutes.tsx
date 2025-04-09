
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SfdDashboardPage from '@/pages/SfdDashboardPage';
import SfdLoansPage from '@/pages/SfdLoansPage';
import SfdClientsPage from '@/pages/SfdClientsPage';
import SfdRoleManagementPage from '@/pages/SfdRoleManagementPage';
import ProtectedRoute from '@/components/routes/ProtectedRoute';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

const SfdRoutes = () => {
  return (
    <Routes>
      <Route 
        path="dashboard" 
        element={
          <ProtectedRoute 
            component={SfdDashboardPage} 
            requireSfdAdmin={true} 
          />
        } 
      />
      <Route 
        path="loans" 
        element={
          <ProtectedRoute 
            component={SfdLoansPage} 
            requireSfdAdmin={true} 
          />
        } 
      />
      <Route 
        path="clients" 
        element={
          <ProtectedRoute 
            component={SfdClientsPage} 
            requireSfdAdmin={true} 
          />
        } 
      />
      <Route 
        path="role-management" 
        element={
          <ProtectedRoute 
            component={SfdRoleManagementPage} 
            requireSfdAdmin={true} 
          />
        } 
      />
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/sfd/dashboard" replace />} />
    </Routes>
  );
};

export default SfdRoutes;
