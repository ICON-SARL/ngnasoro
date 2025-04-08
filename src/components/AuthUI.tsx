
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
import { UserRole } from '@/hooks/auth/types';
import { useToast } from '@/hooks/use-toast';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin'>('default');
  const { user, userRole, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  const { toast } = useToast();
  
  // Check if there's an error in the location state (e.g. redirected from SFD auth)
  useEffect(() => {
    if (location.state?.error === 'not_sfd_admin') {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administrateur SFD. Veuillez utiliser l'interface client ou contacter l'administrateur.",
        variant: "destructive",
      });
      // Clear the error from state
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, toast]);
  
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
  
  // Redirect based on authentication state - only if user is already on auth pages
  useEffect(() => {
    // Only redirect if not loading and user is authenticated AND user is on an auth page
    if (user && !loading && location.pathname.includes('/auth')) {
      console.log('Authenticated user:', user);
      console.log('User role:', userRole);
      
      // Redirection based on user's role
      if (userRole === UserRole.SUPER_ADMIN || user.app_metadata?.role === 'admin') {
        navigate('/super-admin-dashboard');
      } else if (userRole === UserRole.SFD_ADMIN || user.app_metadata?.role === 'sfd_admin') {
        // Rediriger les admins SFD vers leur interface dédiée
        navigate('/agency-dashboard');
      } else {
        // Les utilisateurs normaux vont vers l'interface mobile
        navigate('/mobile-flow');
      }
    }
  }, [user, userRole, loading, navigate, location.pathname, toast]);

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
              <LoginForm adminMode={authMode === 'admin'} isSfdAdmin={false} />
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
                <div className="text-gray-500 text-sm italic mt-1">
                  L'inscription en tant qu'administrateur SFD est effectuée uniquement par un administrateur
                </div>
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
