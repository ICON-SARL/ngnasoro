
import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import SuperAdminDashboard from './SuperAdminDashboard';

const AdminDashboard = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication and redirect if needed
  React.useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
        return;
      }
      
      // Check if user has proper role
      const userRole = user.app_metadata?.role;
      if (userRole !== 'admin' && userRole !== 'super_admin') {
        navigate('/access-denied');
      }
    }
  }, [user, loading, navigate]);

  if (loading) {
    return <div className="p-8 text-center">Chargement du tableau de bord administrateur...</div>;
  }

  // Just render the SuperAdminDashboard since they're functionally equivalent
  return <SuperAdminDashboard />;
};

export default AdminDashboard;
