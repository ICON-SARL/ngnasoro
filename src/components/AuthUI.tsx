
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Check } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import LanguageSelector from './LanguageSelector';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/mobile-flow');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    if (user && session) {
      navigate('/mobile-flow');
    }
  }, [user, session, navigate]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <div className="w-full mb-6 flex justify-center">
          <img 
            src="/lovable-uploads/cb7bbf5f-00ce-4584-a259-df0f14dc7d98.png" 
            alt="Logo" 
            className="h-16 mx-auto"
          />
        </div>
        
        {activeTab === 'login' ? (
          <LoginForm />
        ) : (
          <RegisterForm />
        )}
        
        <div className="mt-4 text-center">
          <button 
            onClick={() => setActiveTab(activeTab === 'login' ? 'register' : 'login')}
            className="text-[#0D6A51] hover:underline"
          >
            {activeTab === 'login' ? "Créer un compte" : "Déjà inscrit ? Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
