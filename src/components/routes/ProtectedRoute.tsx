
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthContext';
import LoadingSpinner from '@/components/ui/loading-spinner';

interface ProtectedRouteProps {
  component: React.ComponentType;
  redirectPath?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  component: Component, 
  redirectPath = '/auth' 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to={redirectPath} replace />;
  }

  return <Component />;
};

export default ProtectedRoute;
