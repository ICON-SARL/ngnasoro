
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader } from 'lucide-react';

const LogoutPage = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    const performLogout = async () => {
      try {
        await signOut();
        // Redirection vers la page de connexion après déconnexion
        navigate('/auth');
      } catch (error) {
        console.error('Erreur lors de la déconnexion:', error);
        // En cas d'erreur, on redirige quand même vers la page de connexion
        navigate('/auth');
      }
    };
    
    performLogout();
  }, [signOut, navigate]);
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md text-center">
        <Loader className="animate-spin h-10 w-10 mx-auto text-[#0D6A51] mb-4" />
        <h1 className="text-xl font-medium mb-2">Déconnexion en cours...</h1>
        <p className="text-gray-600">Veuillez patienter pendant que nous sécurisons votre session.</p>
      </div>
    </div>
  );
};

export default LogoutPage;
