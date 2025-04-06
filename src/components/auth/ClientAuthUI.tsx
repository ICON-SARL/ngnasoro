
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './Logo';
import LoginForm from './login/LoginForm';
import RegisterForm from './RegisterForm';
import { Check } from 'lucide-react';
import LanguageSelector from '../LanguageSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoAccountsCreator from './DemoAccountsCreator';

const ClientAuthUI = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      const timer = setTimeout(() => {
        navigate('/mobile-flow/main', { replace: true });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  useEffect(() => {
    console.log('ClientAuthUI checking user:', { 
      email: user?.email,
      role: user?.app_metadata?.role,
      loading
    });
    
    if (!loading && user) {
      // Route users based on their role
      const userRole = user.app_metadata?.role;
      
      if (userRole === 'admin') {
        console.log('Admin detected in ClientAuthUI, redirecting to super-admin-dashboard');
        navigate('/super-admin-dashboard', { replace: true });
      } else if (userRole === 'sfd_admin') {
        console.log('SFD Admin detected in ClientAuthUI, redirecting to agency-dashboard');
        navigate('/agency-dashboard', { replace: true });
      } else {
        // Regular user goes to mobile flow
        console.log('Regular user detected in ClientAuthUI, redirecting to mobile-flow');
        navigate('/mobile-flow/main', { replace: true });
      }
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md">
        <Logo />
        
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
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
