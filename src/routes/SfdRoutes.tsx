
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SfdAuthUI from '@/components/auth/SfdAuthUI';
import PermissionProtectedRoute from '@/components/routes/PermissionProtectedRoute';
import { UserRole } from '@/utils/auth/roleTypes';
import AccessDeniedPage from '@/pages/AccessDeniedPage';

// This is a placeholder - you should replace it with your actual SFD Dashboard component
const SfdDashboardPlaceholder = () => <div className="p-8">SFD Dashboard</div>;

const SfdRoutes = () => {
  return (
    <Routes>
      <Route path="auth" element={<SfdAuthUI />} />
      <Route 
        path="dashboard" 
        element={
          <PermissionProtectedRoute 
            component={SfdDashboardPlaceholder}
            requiredRole={UserRole.SFD_ADMIN}
          />
        } 
      />
      <Route path="access-denied" element={<AccessDeniedPage />} />
      <Route path="*" element={<Navigate to="/sfd/auth" replace />} />
    </Routes>
  );
};

export default SfdRoutes;
