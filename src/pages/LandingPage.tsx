
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const LandingPage = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Redirect based on user authentication state
  useEffect(() => {
    if (!loading) {
      if (user) {
        // If user is authenticated, check their role
        const userRole = user.app_metadata?.role;
        
        if (userRole === 'admin' || userRole === 'super_admin') {
          navigate('/admin-dashboard');
        } else if (userRole === 'sfd_admin') {
          navigate('/agency-dashboard');
        } else {
          // Regular user
          navigate('/mobile-flow');
        }
      } else {
        // Not authenticated, redirect to auth
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  // Show loading while deciding where to redirect
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-green-100">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Bienvenue au MEREF</h1>
        <div className="animate-spin h-10 w-10 border-4 border-green-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirection en cours...</p>
      </div>
    </div>
  );
};

export default LandingPage;
