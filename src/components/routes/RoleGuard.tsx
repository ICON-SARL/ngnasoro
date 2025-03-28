
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/auth';

interface RoleGuardProps {
  component: React.ComponentType<any>;
  allowedRoles: string[];
  redirectPath?: string;
  [x: string]: any;
}

const RoleGuard: React.FC<RoleGuardProps> = ({ 
  component: Component, 
  allowedRoles,
  redirectPath = '/auth',
  ...rest 
}) => {
  const { user, session, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!user || !session) {
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }
  
  // Extract user role from session
  const userRole = user.app_metadata?.role || 'user';
  
  // Check if user's role is in the allowed roles array
  if (!allowedRoles.includes(userRole)) {
    return <Navigate to={redirectPath} state={{ from: location, error: 'access_denied' }} replace />;
  }

  return <Component {...rest} />;
};

export default RoleGuard;
