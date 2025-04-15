
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AnonymousOnlyGuardProps {
  children: React.ReactNode;
}

const AnonymousOnlyGuard: React.FC<AnonymousOnlyGuardProps> = ({ children }) => {
  const { user, loading, userRole } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mr-2" />
        <span>Chargement...</span>
      </div>
    );
  }
  
  // If user is authenticated, redirect to the appropriate dashboard based on role
  if (user) {
    // Get role from user.app_metadata
    const role = user.app_metadata?.role;
    
    if (role === 'admin') {
      return <Navigate to="/super-admin-dashboard" replace />;
    } else if (role === 'sfd_admin') {
      return <Navigate to="/agency-dashboard" replace />;
    } else {
      // Default for regular users
      return <Navigate to="/mobile-flow/main" replace />;
    }
  }
  
  // If user is not authenticated, render the children (login/register forms)
  return <>{children}</>;
};

export default AnonymousOnlyGuard;
