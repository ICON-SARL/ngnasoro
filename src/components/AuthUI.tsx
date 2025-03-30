
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/login/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Check } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoAccountsCreator from './auth/DemoAccountsCreator';
import { Role } from '@/hooks/auth/types';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd_admin'>('default');
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  // Handle hash in URL for OAuth flows
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
  
  // Redirect based on authentication state
  useEffect(() => {
    // Only redirect if not loading and user is authenticated
    if (user && !loading) {
      console.log('Authenticated user:', user);
      console.log('User role:', userRole);
      
      // Redirection based on user's role
      if (userRole === Role.SUPER_ADMIN) {
        navigate('/super-admin-dashboard');
      } else if (userRole === Role.SFD_ADMIN) {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow');
      }
    }
  }, [user, userRole, loading, navigate]);

  // Update tab based on current route
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
    
    // Detect admin mode from URL
    if (location.pathname.includes('admin/auth') || location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.pathname.includes('sfd/auth') || location.search.includes('sfd_admin=true')) {
      setAuthMode('sfd_admin');
    } else {
      setAuthMode('default');
    }
  }, [location.pathname, location.search]);

  // Show success screen after successful OAuth login
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

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="h-20 w-20 bg-blue-100 text-blue-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
          <h1 className="text-2xl font-bold text-blue-700 mb-3">Chargement en cours...</h1>
          <p className="mt-2 text-gray-600">Veuillez patienter pendant la vérification de votre session.</p>
        </div>
      </div>
    );
  }

  // Show auth UI when not authenticated and not loading
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
                  href="/sfd/auth"
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
                  href="/admin/auth"
                  className="text-amber-600 hover:underline font-medium"
                >
                  Accès Administrateur MEREF
                </a>
              </>
            )}
          </div>
          
          <DemoAccountsCreator />
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
