
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    // Process auth callback and redirect based on user role
    const processCallback = async () => {
      try {
        // If user is already authenticated, redirect to appropriate dashboard
        if (user) {
          const userRole = user.app_metadata?.role;
          if (userRole === 'admin') {
            navigate('/admin-dashboard');
          } else if (userRole === 'sfd_admin') {
            navigate('/dashboard');
          } else {
            navigate('/mobile-flow');
          }
        } else {
          // If authentication failed, redirect to login
          navigate('/auth');
        }
      } catch (error) {
        console.error('Error processing authentication callback:', error);
        navigate('/auth');
      }
    };

    processCallback();
  }, [user, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin h-12 w-12 border-4 border-[#0D6A51] border-t-transparent rounded-full mx-auto mb-4"></div>
        <h2 className="text-2xl font-medium text-gray-700 mb-2">Authentification en cours...</h2>
        <p className="text-gray-500">Veuillez patienter pendant que nous vérifions vos informations.</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage;
