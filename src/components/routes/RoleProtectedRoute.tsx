
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';
import { Loader2 } from 'lucide-react';
import { UserRole } from '@/utils/auth/roleTypes';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin h-8 w-8 text-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // Check for required role if specified
  if (requiredRole) {
    const userRole = user.app_metadata?.role;
    
    // If user role doesn't match required role, redirect to access denied
    if (userRole !== requiredRole) {
      return <Navigate to="/access-denied" state={{ from: location, requiredRole }} replace />;
    }
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
