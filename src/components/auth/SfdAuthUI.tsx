
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Check } from 'lucide-react';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import LanguageSelector from '../LanguageSelector';
import DemoAccountsCreator from './DemoAccountsCreator';

const SfdAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
      console.log("SfdAuthUI: Checking user role for redirection:", user.app_metadata?.role);
      
      // First check for role in app_metadata
      if (user.app_metadata?.role === 'sfd_admin') {
        console.log("SfdAuthUI: Redirecting sfd_admin to /agency-dashboard");
        navigate('/agency-dashboard');
      } 
      // Fallback to checking user_metadata if role is not in app_metadata
      else if (user.user_metadata?.role === 'sfd_admin') {
        console.log("SfdAuthUI: Redirecting based on user_metadata.role to /agency-dashboard");
        navigate('/agency-dashboard');
      }
      // Check for sfd_id presence as another signal of SFD admin status
      else if (user.user_metadata?.sfd_id || user.app_metadata?.sfd_id) {
        console.log("SfdAuthUI: Redirecting based on sfd_id presence to /agency-dashboard");
        navigate('/agency-dashboard');
      }
      // Redirect other users to their appropriate pages
      else {
        console.log("SfdAuthUI: User is not an SFD admin, redirecting elsewhere");
        if (user.app_metadata?.role === 'admin') {
          navigate('/admin/auth');
        } else {
          navigate('/auth');
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
          
          {error && (
            <Alert variant="destructive" className="mb-4 mx-4 mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erreur</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <LoginForm 
            adminMode={false} 
            isSfdAdmin={true} 
            onError={(errorMessage) => setError(errorMessage)}
          />
          
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
