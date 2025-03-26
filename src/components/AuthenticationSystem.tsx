
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { Phone, Key, Upload, RefreshCw, Shield, Smartphone } from 'lucide-react';

const AuthenticationSystem = () => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [authMethod, setAuthMethod] = useState<'sms' | 'voice' | 'face' | 'yubikey'>('sms');
  
  const handleSendOTP = () => {
    // Simulate OTP sending
    console.log(`Sending OTP via ${authMethod} to ${phoneNumber}`);
    setOtpSent(true);
  };
  
  const handleVerifyOTP = () => {
    // Simulate OTP verification
    console.log(`Verifying OTP: ${otpValue}`);
    // In a real app, this would verify the OTP with a backend service
  };
  
  const handleFaceAuth = () => {
    // Simulate facial recognition
    console.log('Initiating facial recognition with liveness check');
    // In a real app, this would use AWS Rekognition
  };
  
  const handleYubiKeyAuth = () => {
    // Simulate YubiKey authentication
    console.log('Waiting for YubiKey hardware authentication');
    // In a real app, this would integrate with YubiKey API
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Authentification Sécurisée</h2>
      
      <Tabs defaultValue="otp" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="otp">
            <Phone className="h-4 w-4 mr-2" />
            OTP
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Shield className="h-4 w-4 mr-2" />
            Avancé
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="otp">
          <div className="space-y-4">
            <div>
              <label htmlFor="phone" className="block text-sm font-medium mb-1">
                Numéro de téléphone
              </label>
              <div className="flex gap-2">
                <Input
                  id="phone"
                  type="tel"
                  placeholder="+223 00 00 00 00"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
                <Button 
                  disabled={!phoneNumber || otpSent}
                  onClick={handleSendOTP}
                >
                  Envoyer
                </Button>
              </div>
            </div>
            
            {otpSent && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Code OTP envoyé</span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuthMethod('sms')}
                      className={authMethod === 'sms' ? 'border-primary' : ''}
                    >
                      <Smartphone className="h-4 w-4 mr-1" />
                      SMS
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setAuthMethod('voice')}
                      className={authMethod === 'voice' ? 'border-primary' : ''}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Vocal
                    </Button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Entrez le code OTP
                  </label>
                  <div className="flex flex-col gap-2 items-center">
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
                    
                    <div className="flex justify-between w-full mt-2">
                      <Button
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
                      
                      <Button onClick={handleVerifyOTP} disabled={otpValue.length !== 6}>
                        Vérifier
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="advanced">
          <div className="space-y-4">
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                    <Upload className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Reconnaissance Faciale</h3>
                    <p className="text-sm text-muted-foreground">Liveness check avec AWS Rekognition</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleFaceAuth}>
                  Démarrer
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mr-3">
                    <Key className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">2FA Matériel (YubiKey)</h3>
                    <p className="text-sm text-muted-foreground">Connectez votre clé de sécurité</p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleYubiKeyAuth}>
                  Connecter
                </Button>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-green-50 flex items-center justify-center text-green-600 mr-3">
                  <Smartphone className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Social Login + Vérification</h3>
                  <p className="text-sm text-muted-foreground">Connexion via compte tiers avec vérification téléphone</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline">
                  Google
                </Button>
                <Button variant="outline">
                  Facebook
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AuthenticationSystem;
