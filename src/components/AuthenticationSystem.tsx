
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { 
  Phone, 
  Key, 
  Upload, 
  RefreshCw, 
  Shield, 
  Smartphone, 
  Camera, 
  Check, 
  Loader2,
  AlertCircle,
  UserPlus,
  Database
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AuthenticationSystemProps {
  onComplete?: () => void;
  mode?: 'verification' | 'enrollment';
}

const AuthenticationSystem: React.FC<AuthenticationSystemProps> = ({ 
  onComplete, 
  mode = 'verification'
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [authMethod, setAuthMethod] = useState<'sms' | 'voice' | 'face' | 'yubikey'>('sms');
  const [faceCapturing, setFaceCapturing] = useState(false);
  const [faceVerified, setFaceVerified] = useState(false);
  const [authComplete, setAuthComplete] = useState(false);
  const [enrollmentStep, setEnrollmentStep] = useState<number>(0);
  const [enrollmentProgress, setEnrollmentProgress] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  const handleSendOTP = () => {
    // Simulate OTP sending
    console.log(`Sending OTP via ${authMethod} to ${phoneNumber}`);
    setOtpSent(true);
  };
  
  const handleVerifyOTP = () => {
    // Simulate OTP verification
    console.log(`Verifying OTP: ${otpValue}`);
    // In a real app, this would verify the OTP with a backend service
    if (otpValue.length === 6) {
      if (mode === 'enrollment') {
        // For enrollment, OTP is just the first step, not the complete auth
        setEnrollmentStep(1);
      } else {
        setAuthComplete(true);
        if (onComplete) onComplete();
      }
    }
  };
  
  const handleFaceAuth = () => {
    // Simulate facial recognition
    setFaceCapturing(true);
    
    if (mode === 'enrollment') {
      // For enrollment, start more complex process
      const simulateFaceEnrollment = () => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setEnrollmentProgress(progress);
          
          if (progress >= 100) {
            clearInterval(interval);
            setFaceCapturing(false);
            setFaceVerified(true);
            setEnrollmentStep(2);
          }
        }, 500);
      };
      
      simulateFaceEnrollment();
    } else {
      // Simple verification
      setTimeout(() => {
        console.log('Face recognition completed with liveness check');
        setFaceCapturing(false);
        setFaceVerified(true);
        setAuthComplete(true);
        if (onComplete) onComplete();
      }, 2000);
    }
  };
  
  const handleYubiKeyAuth = () => {
    // Simulate YubiKey authentication
    console.log('Waiting for YubiKey hardware authentication');
    // In a real app, this would integrate with YubiKey API
    setTimeout(() => {
      setAuthComplete(true);
      if (onComplete) onComplete();
    }, 1500);
  };

  const completeEnrollment = () => {
    setAuthComplete(true);
    if (onComplete) onComplete();
  };

  if (authComplete) {
    return (
      <div className="bg-green-50 rounded-lg p-6 text-center">
        <div className="h-12 w-12 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-3">
          <Check className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-medium text-green-800">
          {mode === 'enrollment' 
            ? 'Inscription biométrique réussie' 
            : 'Authentification réussie'}
        </h3>
        <p className="text-sm text-green-700 mt-1">
          {mode === 'enrollment'
            ? 'Votre profil biométrique a été enregistré dans le système multi-SFD'
            : 'Votre identité a été vérifiée avec succès'}
        </p>
      </div>
    );
  }

  // Render enrollment interface
  if (mode === 'enrollment' && enrollmentStep > 0) {
    return (
      <div className="bg-white rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">
          {enrollmentStep === 1 
            ? 'Enregistrement Biométrique' 
            : 'Finalisation de l\'inscription'}
        </h2>
        
        {enrollmentStep === 1 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex gap-2">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <div>
                Pour compléter votre inscription au système multi-SFD, un enregistrement biométrique de votre visage est requis. 
                Ces données seront cryptées et partagées de façon sécurisée entre les institutions participantes.
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 mr-3">
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Enregistrement Facial</h3>
                    <p className="text-sm text-muted-foreground">Capture et création de profil biométrique sécurisé</p>
                  </div>
                </div>
                {faceCapturing ? (
                  <Button variant="outline" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Capture en cours...
                  </Button>
                ) : faceVerified ? (
                  <Button variant="outline" disabled className="text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Capturé
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleFaceAuth}>
                    Démarrer la capture
                  </Button>
                )}
              </div>
              
              {faceCapturing && (
                <div>
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-3 bg-blue-50 mb-3">
                    <div className="aspect-video bg-black rounded relative overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <Camera className="h-16 w-16 opacity-40" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progression de l'enregistrement</span>
                      <span>{enrollmentProgress}%</span>
                    </div>
                    <Progress value={enrollmentProgress} className="h-2" />
                    
                    <ul className="text-sm space-y-1 mt-2">
                      <li className="flex items-center text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Détection de visage
                      </li>
                      <li className="flex items-center text-green-600">
                        <Check className="h-3 w-3 mr-1" />
                        Vérification de vivacité
                      </li>
                      <li className={`flex items-center ${enrollmentProgress >= 50 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {enrollmentProgress >= 50 ? <Check className="h-3 w-3 mr-1" /> : <div className="h-3 w-3 mr-1" />}
                        Capture des caractéristiques faciales
                      </li>
                      <li className={`flex items-center ${enrollmentProgress >= 80 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {enrollmentProgress >= 80 ? <Check className="h-3 w-3 mr-1" /> : <div className="h-3 w-3 mr-1" />}
                        Génération du hachage biométrique
                      </li>
                      <li className={`flex items-center ${enrollmentProgress >= 100 ? 'text-green-600' : 'text-muted-foreground'}`}>
                        {enrollmentProgress >= 100 ? <Check className="h-3 w-3 mr-1" /> : <div className="h-3 w-3 mr-1" />}
                        Stockage sécurisé multi-SFD
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {enrollmentStep === 2 && (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg flex gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium text-green-800">Profil biométrique créé avec succès</h3>
                <p className="text-sm text-green-700 mt-1">
                  Votre identité a été vérifiée et votre profil biométrique a été créé pour une utilisation dans tout le réseau SFD.
                </p>
              </div>
            </div>
            
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2 flex items-center">
                <Database className="h-4 w-4 mr-2 text-[#0D6A51]" />
                Synchronisation multi-SFD
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Votre identité numérique sera partagée de manière sécurisée entre les institutions suivantes:
              </p>
              
              <ul className="space-y-2 mb-4">
                <li className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="h-6 w-6 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Microfinance Bamako</span>
                </li>
                <li className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="h-6 w-6 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">SFD Mopti</span>
                </li>
                <li className="flex items-center p-2 bg-gray-50 rounded">
                  <div className="h-6 w-6 rounded-full bg-[#0D6A51]/10 flex items-center justify-center text-[#0D6A51] mr-2">
                    <Check className="h-3 w-3" />
                  </div>
                  <span className="text-sm">Coopérative Sikasso</span>
                </li>
              </ul>
              
              <Button onClick={completeEnrollment} className="w-full">
                Finaliser l'inscription
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render regular authentication interface (OTP or verification)
  return (
    <div className="bg-white rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">
        {mode === 'enrollment' ? 'Inscription Sécurisée' : 'Authentification Sécurisée'}
      </h2>
      
      <Tabs defaultValue="otp" className="w-full">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="otp">
            <Phone className="h-4 w-4 mr-2" />
            OTP
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Shield className="h-4 w-4 mr-2" />
            Biométrique
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
                    <Camera className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Reconnaissance Faciale</h3>
                    <p className="text-sm text-muted-foreground">Vérification d'identité avec liveness check</p>
                  </div>
                </div>
                {faceCapturing ? (
                  <Button variant="outline" disabled>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Analyse...
                  </Button>
                ) : faceVerified ? (
                  <Button variant="outline" disabled className="text-green-600">
                    <Check className="h-4 w-4 mr-2" />
                    Vérifié
                  </Button>
                ) : (
                  <Button variant="outline" onClick={handleFaceAuth}>
                    Démarrer
                  </Button>
                )}
              </div>
              {faceCapturing && (
                <div className="mt-3 p-3 bg-blue-50 rounded-lg text-center">
                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 mb-2">
                    <div className="h-24 flex items-center justify-center text-blue-500">
                      <Camera className="h-12 w-12" />
                    </div>
                  </div>
                  <p className="text-sm text-blue-700">Veuillez regarder directement la caméra et suivre les instructions</p>
                </div>
              )}
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
