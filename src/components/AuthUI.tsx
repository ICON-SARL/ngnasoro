
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import Logo from './auth/Logo';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import { Check } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import LanguageSelector from './LanguageSelector';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
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
      navigate('/mobile-flow');
    }
  }, [user, session, navigate]);

  if (authSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0D6A51] to-[#064335] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl p-8 text-center">
          <div className="h-20 w-20 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-6">
            <Check className="h-10 w-10" />
          </div>
          <h1 className="text-3xl font-bold text-green-700 mb-3">Connexion réussie!</h1>
          <p className="mt-2 text-gray-600 text-lg">Vous allez être redirigé vers l'application...</p>
          <div className="mt-6">
            <VoiceAssistant 
              message="Connexion réussie! Vous allez être redirigé vers l'application." 
              autoPlay={true} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0D6A51] to-[#064335] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>
      
      <div className="w-full max-w-md bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-xl flex flex-col items-center">
        <div className="w-full mb-6">
          <Logo />
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full mb-8 rounded-xl overflow-hidden shadow-lg">
            <TabsTrigger 
              value="login" 
              className="py-5 text-xl font-bold data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700"
            >
              Connexion
            </TabsTrigger>
            <TabsTrigger 
              value="register" 
              className="py-5 text-xl font-bold data-[state=active]:bg-[#0D6A51] data-[state=active]:text-white data-[state=inactive]:bg-white data-[state=inactive]:text-gray-700"
            >
              Inscription
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="focus-visible:outline-none focus-visible:ring-0 w-full">
            <LoginForm />
          </TabsContent>
          
          <TabsContent value="register" className="focus-visible:outline-none focus-visible:ring-0 w-full">
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthUI;
