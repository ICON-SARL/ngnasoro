
import React from 'react';
import SuperAdminDashboard from './SuperAdminDashboard';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication and redirect if needed
  React.useEffect(() => {
    if (!loading && !user) {
      navigate('/admin/auth');
    }
  }, [user, loading, navigate]);

  // Render SuperAdminDashboard since they're functionally equivalent
  return <SuperAdminDashboard />;
};

export default AdminDashboard;
