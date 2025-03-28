
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/auth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Check } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useRoleRedirect } from '@/hooks/auth/useRoleRedirect';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd'>('default');
  const { user, session, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  // Use the role-based redirect hook
  useRoleRedirect();
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      // Role-based redirecting will be handled by useRoleRedirect
      const timer = setTimeout(() => {
        if (userRole === 'admin') {
          navigate('/super-admin-dashboard');
        } else if (userRole === 'sfd_admin') {
          navigate('/agency-dashboard');
        } else {
          navigate('/mobile-flow');
        }
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate, userRole]);
  
  // Auto-redirect based on user role
  useEffect(() => {
    if (user && session) {
      if (userRole === 'admin') {
        navigate('/super-admin-dashboard');
      } else if (userRole === 'sfd_admin') {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow');
      }
    }
  }, [user, session, navigate, userRole]);

  // Update tab based on current route
  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
    
    // Détection du mode auth par l'URL
    if (location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.search.includes('sfd=true')) {
      setAuthMode('sfd');
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
          {authMode !== 'default' && (
            <div className={`p-4 ${authMode === 'admin' ? 'bg-amber-50 border-b border-amber-100' : 'bg-blue-50 border-b border-blue-100'}`}>
              <div className="flex items-center justify-between">
                <h2 className={`${authMode === 'admin' ? 'text-amber-800' : 'text-blue-800'} font-medium`}>
                  {authMode === 'admin' ? 'Connexion Super Admin MEREF' : 'Connexion Administration SFD'}
                </h2>
                <Badge variant="outline" className={authMode === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}>
                  {authMode === 'admin' ? 'MEREF' : 'SFD'}
                </Badge>
              </div>
            </div>
          )}
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              {authMode === 'default' && (
                <TabsTrigger value="register">Inscription</TabsTrigger>
              )}
              {authMode !== 'default' && (
                <TabsTrigger value="register" disabled>Inscription</TabsTrigger>
              )}
            </TabsList>
            <TabsContent value="login">
              <LoginForm adminMode={authMode === 'admin'} sfdMode={authMode === 'sfd'} />
            </TabsContent>
            <TabsContent value="register">
              <RegisterForm />
            </TabsContent>
          </Tabs>
          
          <div className="mt-4 text-center pb-6 flex justify-center gap-4">
            {authMode === 'default' ? (
              <>
                <a 
                  href="/auth?admin=true"
                  className="text-amber-600 hover:underline font-medium"
                >
                  Accès Super Admin
                </a>
                <a 
                  href="/auth?sfd=true"
                  className="text-blue-600 hover:underline font-medium"
                >
                  Accès Admin SFD
                </a>
              </>
            ) : (
              <a 
                href="/auth"
                className="text-[#0D6A51] hover:underline font-medium"
              >
                Connexion Utilisateur Standard
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
