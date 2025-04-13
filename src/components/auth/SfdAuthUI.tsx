
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

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
      console.log("SfdAuthUI - User detected:", user);
      console.log("SfdAuthUI - User role:", user.app_metadata?.role);
      
      // Ajouter un petit délai pour s'assurer que les rôles sont correctement chargés
      setTimeout(() => {
        if (user.app_metadata?.role === 'sfd_admin') {
          navigate('/agency-dashboard');
        } else {
          // Rediriger les utilisateurs non-SFD vers leur page appropriée
          if (user.app_metadata?.role === 'admin') {
            navigate('/admin/auth');
          } else {
            navigate('/auth');
          }
        }
      }, 100);
    }
  }, [user, loading, navigate]);

  // Ajout d'un timeout pour éviter le chargement infini
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.log('SfdAuthUI loading timed out after 5 seconds');
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [loading]);

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

  // Limiter le temps d'affichage du chargement
  if (loading) {
    return (
      <div className="auth-container bg-gradient-to-b from-blue-50 to-blue-100">
        <div className="max-w-md w-full auth-card p-8 text-center">
          <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-blue-700 mb-3">Chargement en cours...</h1>
          <p className="mt-2 text-gray-600">Veuillez patienter pendant la vérification de votre session.</p>
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
          
          <LoginForm 
            adminMode={false} 
            isSfdAdmin={true}
          />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <Link 
              to="/login"
              className="text-blue-600 hover:underline font-medium"
            >
              Changer de type de connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SfdAuthUI;
