
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUserRole } from '@/hooks/useUserRole';
import { Loader2 } from 'lucide-react';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: string[];
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
  fallbackPath = '/unauthorized'
}) => {
  const { roles, isLoading } = useUserRole();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span>Chargement des permissions...</span>
      </div>
    );
  }

  const hasRequiredRole = roles.some(role => allowedRoles.includes(role));

  if (!hasRequiredRole) {
    return <Navigate to={fallbackPath} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
