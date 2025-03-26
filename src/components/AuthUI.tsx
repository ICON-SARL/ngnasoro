
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { AuthenticationSystem } from '@/components/AuthenticationSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Phone, Lock, Mail, User, RefreshCw } from 'lucide-react';

const AuthUI = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  
  const handleSendOTP = () => {
    // Simulate OTP sending
    console.log(`Sending OTP to ${phoneNumber}`);
    setOtpSent(true);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt');
  };
  
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration attempt');
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
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+223 00 00 00 00"
                      className="pl-10"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                  </div>
                </div>
                
                {!otpSent ? (
                  <Button 
                    type="button" 
                    className="w-full" 
                    onClick={handleSendOTP}
                    disabled={!phoneNumber}
                  >
                    Envoyer le code OTP
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Entrez le code reçu par SMS
                      </label>
                      <InputOTP maxLength={6} value={otpValue} onChange={setOtpValue}>
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>
                    
                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setOtpSent(false);
                          setOtpValue('');
                        }}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Renvoyer
                      </Button>
                      
                      <Button 
                        type="submit" 
                        disabled={otpValue.length !== 6}
                      >
                        Se connecter
                      </Button>
                    </div>
                  </div>
                )}
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">Ou</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline">Google</Button>
                  <Button variant="outline">Facebook</Button>
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
                    />
                  </div>
                </div>
                
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
        
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-3">Mode d'authentification avancé</h3>
          <AuthenticationSystem />
        </div>
      </div>
    </div>
  );
};

export default AuthUI;
