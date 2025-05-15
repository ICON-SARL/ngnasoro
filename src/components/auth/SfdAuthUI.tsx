
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from '@/components/auth/login/LoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const SfdAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
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
      console.log("SfdAuthUI - User detected:", user);
      console.log("SfdAuthUI - User role:", user.app_metadata?.role);
      
      // Verifier le rôle directement depuis les métadonnées
      const userRole = user.app_metadata?.role;
      
      if (userRole === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        // Si on a un rôle mais pas celui de sfd_admin, on affiche une erreur
        if (userRole) {
          setAuthError(`Accès refusé. Vous n'avez pas le rôle d'administrateur SFD (rôle actuel: ${userRole}).`);
        } else {
          // Si pas de rôle défini, rediriger vers l'auth appropriée
          if (userRole === 'admin') {
            navigate('/admin/auth');
          } else {
            navigate('/auth');
          }
        }
      }
    }
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="auth-container bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="max-w-md w-full auth-card p-8 text-center">
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
    <div className="auth-container bg-gradient-to-b from-blue-50 to-blue-100">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="auth-card">
          <div className="p-4 bg-blue-50 border-b border-blue-100">
            <h2 className="text-blue-800 font-medium text-center">
              Connexion Administration SFD
            </h2>
          </div>
          
          {authError && (
            <div className="p-4 bg-red-50 text-red-800 text-sm">
              <p>{authError}</p>
            </div>
          )}
          
          <LoginForm 
            adminMode={false} 
            isSfdAdmin={true}
            onError={setAuthError}
          />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <a 
              href="/auth"
              className="text-blue-600 hover:underline font-medium"
            >
              Changer de type de connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SfdAuthUI;
