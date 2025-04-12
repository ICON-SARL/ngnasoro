
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import RegisterForm from './RegisterForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoAccountsCreator from './DemoAccountsCreator';

const ClientAuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { user, loading, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/mobile-flow/main');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    if (user && !loading) {
      console.log('Authenticated user from ClientAuthUI:', user);
      console.log('User role from auth context:', userRole);
      
      // Get user role from app_metadata
      const role = user.app_metadata?.role;
      console.log('User role from metadata:', role);
      
      // Redirect based on role
      if (role === 'admin') {
        navigate('/super-admin-dashboard');
      } else if (role === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow/main');
      }
    }
  }, [user, userRole, loading, navigate, location.pathname]);
  
  useEffect(() => {
    // Set active tab (login or register)
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  if (authSuccess) {
    return (
      <div className="auth-container">
        <div className="max-w-md w-full auth-card p-8 text-center">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers l'application...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="auth-container">
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
    <div className="auth-container">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="auth-card">
          <div className="p-4 bg-[#0D6A51]/10 border-b border-[#0D6A51]/20">
            <h2 className="text-[#0D6A51] font-medium text-center">
              Espace Client
            </h2>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm adminMode={false} isSfdAdmin={false} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center pb-6">
            <Link to="/admin/auth" className="text-amber-600 hover:underline font-medium">
              Accès Admin
            </Link>
            <span className="mx-2 text-gray-400">•</span>
            <Link to="/sfd/auth" className="text-blue-600 hover:underline font-medium">
              Accès SFD
            </Link>
          </div>
          
          <DemoAccountsCreator />
        </div>
      </div>
    </div>
  );
};

export default ClientAuthUI;
