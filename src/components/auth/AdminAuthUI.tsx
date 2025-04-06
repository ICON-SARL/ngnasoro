
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';
import DemoAccountsCreator from './DemoAccountsCreator';

const AdminAuthUI = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/super-admin-dashboard', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    console.log('AdminAuthUI checking user:', { 
      email: user?.email,
      role: user?.app_metadata?.role,
      loading
    });
    
    if (!loading && user) {
      const userRole = user.app_metadata?.role;
      
      if (userRole === 'admin') {
        console.log('Admin detected, redirecting to super-admin-dashboard');
        navigate('/super-admin-dashboard', { replace: true });
      } else if (userRole === 'sfd_admin') {
        // Redirect SFD admin to agency dashboard
        console.log('SFD Admin detected in AdminAuthUI, redirecting to agency dashboard');
        navigate('/agency-dashboard', { replace: true });
      } else {
        // Redirect regular users to mobile flow
        console.log('Regular user detected in AdminAuthUI, redirecting to mobile flow');
        navigate('/mobile-flow/main', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
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
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-4 bg-amber-50 border-b border-amber-100">
            <h2 className="text-amber-800 font-medium text-center">
              Connexion Administration MEREF
            </h2>
          </div>
          
          <LoginForm adminMode={true} isSfdAdmin={false} />
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            <a 
              href="/auth"
              className="text-[#0D6A51] hover:underline font-medium"
            >
              Connexion Utilisateur Standard
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

export default AdminAuthUI;
