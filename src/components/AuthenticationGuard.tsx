
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface AuthenticationGuardProps {
  children: React.ReactNode;
}

const AuthenticationGuard: React.FC<AuthenticationGuardProps> = ({ children }) => {
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
    // Redirect to login with the current location saved
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  // If user is authenticated, render the children
  return <>{children}</>;
};

export default AuthenticationGuard;
