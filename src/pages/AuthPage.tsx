
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const AuthPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // If already logged in, redirect to appropriate page
  React.useEffect(() => {
    if (user) {
      navigate('/profile');
    }
  }, [user, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Connexion</h1>
        
        <div className="space-y-4">
          <p className="text-center text-gray-500">
            Page d'authentification en cours de développement. 
            Utilisez les composants AuthUI existants pour une implémentation complète.
          </p>
          
          <div className="mt-6 space-y-2">
            <button 
              onClick={() => navigate('/')}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
