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
import { supabase } from '@/integrations/supabase/client';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [authMode, setAuthMode] = useState<'default' | 'admin' | 'sfd'>('default');
  const { user, session, userRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  useRoleRedirect();
  
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
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

  useEffect(() => {
    if (location.pathname.includes('register')) {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }
    
    if (location.search.includes('admin=true')) {
      setAuthMode('admin');
    } else if (location.search.includes('sfd=true')) {
      setAuthMode('sfd');
    } else {
      setAuthMode('default');
    }
  }, [location.pathname, location.search]);

  const createTestUsers = async () => {
    if (!window.confirm("Créer des utilisateurs de test? Cela va créer un Super Admin, un Admin SFD et un utilisateur standard.")) {
      return;
    }
    
    const testUsers = [
      {
        email: "superadmin@meref.ml",
        password: "testadmin123",
        full_name: "Super Admin Test",
        role: "admin"
      },
      {
        email: "sfdadmin@meref.ml",
        password: "testadmin123",
        full_name: "SFD Admin Test",
        role: "sfd_admin"
      },
      {
        email: "user@meref.ml",
        password: "testuser123",
        full_name: "Utilisateur Test",
        role: "user"
      }
    ];
    
    try {
      for (const user of testUsers) {
        const { data, error } = await supabase.functions.invoke('create-admin-user', {
          body: JSON.stringify(user)
        });
        
        if (error) {
          console.error(`Erreur lors de la création de ${user.email}:`, error);
        } else {
          console.log(`Utilisateur ${user.email} créé avec succès:`, data);
        }
      }
      
      alert("Utilisateurs de test créés avec succès. Vous pouvez maintenant vous connecter avec:\n\n" +
            "Super Admin: superadmin@meref.ml / testadmin123\n" +
            "SFD Admin: sfdadmin@meref.ml / testadmin123\n" +
            "Utilisateur: user@meref.ml / testuser123");
    } catch (error) {
      console.error("Erreur lors de la création des utilisateurs de test:", error);
      alert("Erreur lors de la création des utilisateurs de test. Voir la console pour plus de détails.");
    }
  };

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
        
          <div className="mt-2 text-center pb-2">
            <button
              onClick={createTestUsers}
              className="text-xs text-gray-500 hover:underline"
            >
              Créer des utilisateurs de test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
