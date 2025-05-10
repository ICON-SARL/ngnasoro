
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/AuthContext';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRole: string;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ children, requiredRole }) => {
  const { user, userRole, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement des permissions...</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Compare the actual role with the required role (case-insensitive)
  const hasRequiredRole = userRole?.toLowerCase() === requiredRole.toLowerCase();

  if (!hasRequiredRole) {
    return <Navigate to="/access-denied" state={{ from: location, requiredRole }} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
