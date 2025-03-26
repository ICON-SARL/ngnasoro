
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Lock, Mail, User, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();
  
  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate('/mobile-flow');
    }
  }, [user, navigate]);
  
  const handleSendOTP = () => {
    // For now we'll simulate OTP sending
    console.log(`Sending OTP to ${phoneNumber}`);
    setOtpSent(true);
  };
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    await signIn(email, password);
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUp(email, password, fullName);
    setActiveTab('login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <img 
            src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
            alt="NGNA SÔRÔ! Logo" 
            className="h-16 mx-auto"
          />
          <h1 className="text-2xl font-bold mt-2">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
          </h1>
          <p className="text-sm text-[#0D6A51]">MEREF - SFD</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 w-full">
              <TabsTrigger value="login">Connexion</TabsTrigger>
              <TabsTrigger value="register">Inscription</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login" className="p-6">
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-medium mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full"
                >
                  Se connecter
                </Button>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" type="button">Google</Button>
                  <Button variant="outline" type="button">Facebook</Button>
                </div>
              </form>
            </TabsContent>
            
            <TabsContent value="register" className="p-6">
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-1">
                    Nom complet
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      type="text"
                      placeholder="Nom et prénom"
                      className="pl-10"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reg-email" className="block text-sm font-medium mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="email@example.com"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone-reg" className="block text-sm font-medium mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone-reg"
                      type="tel"
                      placeholder="+223 00 00 00 00"
                      className="pl-10"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="reg-password" className="block text-sm font-medium mb-1">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full">
                  Créer un compte
                </Button>
                
                <p className="text-center text-xs text-muted-foreground">
                  En créant un compte, vous acceptez nos{" "}
                  <a href="#" className="underline">
                    Conditions d'utilisation
                  </a>{" "}
                  et notre{" "}
                  <a href="#" className="underline">
                    Politique de confidentialité
                  </a>
                  .
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
