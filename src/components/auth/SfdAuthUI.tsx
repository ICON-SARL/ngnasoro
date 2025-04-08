
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';
import DemoAccountsCreator from './DemoAccountsCreator';

const SfdAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/agency-dashboard');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    if (user && !loading) {
      console.log("SfdAuthUI - User authenticated:", user.email, "Role:", user.app_metadata?.role);
      const userRole = user.app_metadata?.role;
      
      if (userRole === 'sfd_admin') {
        console.log("SfdAuthUI - Redirecting to agency dashboard");
        navigate('/agency-dashboard');
      } else if (userRole === 'admin') {
        // Redirect main administrators to their own dashboard
        console.log("SfdAuthUI - Redirecting admin to super-admin-dashboard");
        navigate('/super-admin-dashboard');
      } else {
        // For all other users, show a message and redirect to appropriate auth
        console.log("SfdAuthUI - Redirecting regular user to auth");
        navigate('/auth', { state: { error: 'not_sfd_admin' } });
      }
    }
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-blue-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers le tableau de bord SFD...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-blue-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h2 className="text-blue-800 font-medium text-center">
              Connexion Administration SFD
            </h2>
          </div>
          
          <LoginForm adminMode={false} isSfdAdmin={true} />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <a 
              href="/auth"
              className="text-[#0D6A51] hover:underline font-medium"
            >
              Connexion Utilisateur Standard
            </a>
            <a 
              href="/admin/auth"
              className="text-amber-600 hover:underline font-medium"
            >
              Accès Administrateur MEREF
            </a>
          </div>
          
          <DemoAccountsCreator />
        </div>
      </div>
    </div>
  );
};

export default SfdAuthUI;
