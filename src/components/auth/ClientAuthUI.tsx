
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';
import DemoAccountsCreator from './DemoAccountsCreator';

const ClientAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    if (user && !loading) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers votre espace client...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 bg-green-50 border-b border-green-100">
            <h2 className="text-green-800 font-medium text-center">
              Espace Client
            </h2>
          </div>
          
          <LoginForm adminMode={false} isSfdAdmin={false} />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <a 
              href="/admin/auth"
              className="text-amber-600 hover:underline font-medium"
            >
              Accès Administrateur MEREF
            </a>
            <a 
              href="/sfd/auth"
              className="text-blue-600 hover:underline font-medium"
            >
              Accès Administrateur SFD
            </a>
          </div>
          
          <DemoAccountsCreator />
        </div>
      </div>
    </div>
  );
};

export default ClientAuthUI;
