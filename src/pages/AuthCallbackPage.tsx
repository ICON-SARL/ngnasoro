
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // Extract code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (!code) {
          throw new Error('Authorization code missing');
        }

        // Instead of actual API call, let's simulate a successful login 
        // with mocked user data for now
        setTimeout(() => {
          // Mock user object
          const mockUser = {
            id: 'user-123',
            email: 'user@example.com',
            name: 'Test User',
            role: 'sfd_admin',
            sfd_id: 'sfd-123'
          };

          // Set the user in auth context - Using the login function from auth context
          auth.login(mockUser, 'mock-jwt-token');

          // Redirect based on role
          if (mockUser.role === 'admin') {
            navigate('/admin-dashboard');
          } else if (mockUser.role === 'sfd_admin') {
            navigate('/dashboard');
          } else {
            navigate('/profile');
          }
        }, 1500);
      } catch (err) {
        console.error('Authentication error:', err);
        setError('Failed to authenticate. Please try again.');
      }
    };

    processAuthCallback();
  }, [navigate, auth]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 text-red-500">{error}</div>
          <button 
            onClick={() => navigate('/auth')}
            className="rounded bg-primary px-4 py-2 text-white"
          >
            Retour à la page de connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <Loader className="h-10 w-10 animate-spin text-primary" />
      <p className="mt-4 text-lg">Authentification en cours...</p>
    </div>
  );
};

export default AuthCallbackPage;
