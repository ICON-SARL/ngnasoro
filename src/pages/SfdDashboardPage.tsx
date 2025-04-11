
import React from 'react';
import { SfdAdminDashboard } from '@/components/admin/SfdAdminDashboard';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

const SfdDashboardPage = () => {
  const { user, isAdmin } = useAuth();

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect super admins to their dashboard
  if (isAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return <SfdAdminDashboard />;
};

export default SfdDashboardPage;
