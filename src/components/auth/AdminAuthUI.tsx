
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';

const AdminAuthUI = () => {
  const { user, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/super-admin-dashboard');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    if (user && !loading) {
      if (user.app_metadata?.role === 'admin') {
        navigate('/super-admin-dashboard');
      } else {
        // Rediriger les utilisateurs non-admin vers leur page appropriée
        if (user.app_metadata?.role === 'sfd_admin') {
          navigate('/sfd/auth');
        } else {
          navigate('/auth');
        }
      }
    }
  }, [user, loading, navigate]);

  if (authSuccess) {
    return (
      <div className="auth-container bg-gradient-to-b from-[#fcf9f2] to-[#f8f4e5]">
        <div className="max-w-md w-full auth-card p-8 text-center">
          <div className="h-20 w-20 bg-[#f0e9d2] text-[#b88746] rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-[#8B5A2B] mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers le tableau de bord administrateur...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container bg-gradient-to-b from-[#f8f7ff] to-[#e9e7f8]">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="auth-card shadow-lg border-0">
          <div className="p-4 bg-gradient-to-r from-[#1A1F2C] to-[#2A3042] border-b border-gray-800">
            <h2 className="text-white font-medium text-center">
              Connexion Administration MEREF
            </h2>
          </div>
          
          <LoginForm adminMode={true} isSfdAdmin={false} />
        </div>
      </div>
    </div>
  );
};

export default AdminAuthUI;
