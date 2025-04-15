
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AnonymousOnlyGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (user) {
    return <Navigate to="/mobile-flow/main" replace />;
  }

  return <>{children}</>;
};

export default AnonymousOnlyGuard;
