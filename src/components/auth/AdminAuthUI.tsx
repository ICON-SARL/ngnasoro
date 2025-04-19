
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import { Check, Shield } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const AdminAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if this is the SFD admin login page
  const isSfdAdminPage = location.pathname.includes('/sfd/auth');
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        // Redirect based on login page type
        if (isSfdAdminPage) {
          navigate('/agency-dashboard');
        } else {
          navigate('/super-admin-dashboard');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate, isSfdAdminPage]);
  
  useEffect(() => {
    if (user && !loading) {
      console.log("AdminAuthUI - User detected:", user);
      console.log("AdminAuthUI - User role:", user.app_metadata?.role);
      
      if (user.app_metadata?.role === 'admin') {
        navigate('/super-admin-dashboard');
      } else if (user.app_metadata?.role === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        // Redirect non-admin users to appropriate page
        navigate('/auth');
      }
    }
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="auth-container bg-gradient-to-b from-amber-50 to-amber-100">
        <div className="max-w-md w-full auth-card p-8 text-center">
          <div className="h-20 w-20 bg-amber-100 text-amber-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-amber-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers le tableau de bord administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container bg-gradient-to-b from-amber-50 to-amber-100">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="auth-card">
          <div className="p-4 bg-amber-50 border-b border-amber-100">
            <h2 className="text-amber-800 font-medium text-center">
              {isSfdAdminPage ? "Connexion Administration SFD" : "Connexion Administration MEREF"}
            </h2>
          </div>
          
          <div className="p-4 bg-amber-50 text-amber-800 flex items-start gap-2">
            <Shield className="h-5 w-5 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">
                {isSfdAdminPage 
                  ? "Accès réservé aux administrateurs SFD" 
                  : "Accès réservé aux administrateurs MEREF"}
              </p>
              <p className="text-xs mt-1">
                Cette interface est uniquement destinée aux administrateurs système. 
                Les administrateurs n'ont pas accès à l'interface mobile.
              </p>
            </div>
          </div>
          
          <LoginForm 
            adminMode={true} 
            isSfdAdmin={isSfdAdminPage} 
            onError={(errorMessage) => setError(errorMessage)}
          />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <Link 
              to={isSfdAdminPage ? "/admin/auth" : "/sfd/auth"}
              className="text-amber-600 hover:underline font-medium"
            >
              {isSfdAdminPage 
                ? "Accéder à la connexion administrateur MEREF" 
                : "Accéder à la connexion administrateur SFD"}
            </Link>
            <Link 
              to="/login"
              className="text-amber-600 hover:underline font-medium"
            >
              Changer de type de connexion
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAuthUI;
