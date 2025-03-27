
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Check } from 'lucide-react';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const { user, session } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [authSuccess, setAuthSuccess] = useState(false);
  
  // Check if the URL contains a session hash which indicates a magic link login
  useEffect(() => {
    const hash = location.hash;
    if (hash && hash.includes('access_token')) {
      setAuthSuccess(true);
      
      // Redirect after showing success message
      const timer = setTimeout(() => {
        navigate('/mobile-flow');
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);
  
  // Redirect if already logged in
  useEffect(() => {
    if (user && session) {
      navigate('/mobile-flow');
    }
  }, [user, session, navigate]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
            <Check className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-green-700">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600">Vous allez être redirigé vers l'application...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Logo />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-6 rounded-xl overflow-hidden">
            <TabsTrigger value="login" className="py-3 data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
              Connexion
            </TabsTrigger>
            <TabsTrigger value="register" className="py-3 data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white">
              Inscription
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthUI;
