
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Check } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd_admin'>('default');
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
      // Redirection basée sur le rôle de l'utilisateur
      if (user.app_metadata?.role === 'admin') {
        navigate('/super-admin-dashboard');
      } else if (user.app_metadata?.role === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow');
      }
    }
  }, [user, session, navigate]);

  // Update tab based on current route
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
    
    // Détection du mode admin par l'URL
    if (location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.search.includes('sfd_admin=true')) {
      setAuthMode('sfd_admin');
    } else {
      setAuthMode('default');
    }
  }, [location.pathname, location.search]);

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
          {authMode === 'admin' && (
            <div className="p-4 bg-amber-50 border-b border-amber-100">
              <h2 className="text-amber-800 font-medium text-center">
                Connexion Administration
              </h2>
            </div>
          )}
          
          {authMode === 'sfd_admin' && (
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h2 className="text-blue-800 font-medium text-center">
                Connexion Administration SFD
              </h2>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <LoginForm adminMode={authMode === 'admin'} isSfdAdmin={authMode === 'sfd_admin'} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center pb-6 flex flex-col gap-2">
            {authMode === 'default' && (
              <>
                <a 
                  href="/auth?admin=true"
                  className="text-[#0D6A51] hover:underline font-medium"
                >
                  Accès Administrateur MEREF
                </a>
                <a 
                  href="/auth?sfd_admin=true"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Accès Administrateur SFD
                </a>
              </>
            )}
            
            {authMode === 'admin' && (
              <>
                <a 
                  href="/auth"
                  className="text-[#0D6A51] hover:underline font-medium"
                >
                  Connexion Utilisateur Standard
                </a>
                <a 
                  href="/auth?sfd_admin=true"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Accès Administrateur SFD
                </a>
              </>
            )}
            
            {authMode === 'sfd_admin' && (
              <>
                <a 
                  href="/auth"
                  className="text-[#0D6A51] hover:underline font-medium"
                >
                  Connexion Utilisateur Standard
                </a>
                <a 
                  href="/auth?admin=true"
                  className="text-amber-600 hover:underline font-medium"
                >
                  Accès Administrateur MEREF
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
