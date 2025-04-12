
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Check } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoAccountsCreator from './auth/DemoAccountsCreator';
import { UserRole } from '@/hooks/auth/types';
import { useToast } from '@/hooks/use-toast';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd_admin'>('default');
  const { user, userRole, loading, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const { toast } = useToast();
  
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
      console.log('Authenticated user:', user);
      console.log('User role from auth context:', userRole);
      
      // Get user role from app_metadata
      const role = user.app_metadata?.role;
      console.log('User role from metadata:', role);
      
      // Redirect based on role
      if (role === UserRole.SuperAdmin) {
        navigate('/super-admin-dashboard');
      } else if (role === UserRole.SfdAdmin) {
        navigate('/agency-dashboard');
      } else {
        navigate('/mobile-flow/main');
      }
    }
  }, [user, userRole, loading, navigate, location.pathname, toast]);
  
  useEffect(() => {
    // Check if we're on a specific page to set authentication mode
    if (location.pathname.includes('admin/auth') || location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.pathname.includes('sfd/auth') || location.search.includes('sfd_admin=true')) {
      setAuthMode('sfd_admin');
    } else {
      setAuthMode('default');
    }
    
    // Set active tab (login or register)
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
  }, [location.pathname, location.search]);
  
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
          
          {authMode === 'default' && (
            <div className="p-4 bg-[#0D6A51]/10 border-b border-[#0D6A51]/20">
              <h2 className="text-[#0D6A51] font-medium text-center">
                Espace Client
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
          
          <div className="mt-4 text-center pb-6">
            {authMode === 'admin' ? (
              <>
                <Link to="/auth" className="text-[#0D6A51] hover:underline font-medium">
                  Accès Client
                </Link>
                <span className="mx-2 text-gray-400">•</span>
                <Link to="/sfd/auth" className="text-blue-600 hover:underline font-medium">
                  Accès SFD
                </Link>
              </>
            ) : authMode === 'sfd_admin' ? (
              <>
                <Link to="/auth" className="text-[#0D6A51] hover:underline font-medium">
                  Accès Client
                </Link>
                <span className="mx-2 text-gray-400">•</span>
                <Link to="/admin/auth" className="text-amber-600 hover:underline font-medium">
                  Accès Admin
                </Link>
              </>
            ) : (
              <>
                <Link to="/admin/auth" className="text-amber-600 hover:underline font-medium">
                  Accès Admin
                </Link>
                <span className="mx-2 text-gray-400">•</span>
                <Link to="/sfd/auth" className="text-blue-600 hover:underline font-medium">
                  Accès SFD
                </Link>
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
