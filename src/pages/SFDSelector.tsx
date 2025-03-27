import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import GeoAgencySelector from '@/components/GeoAgencySelector';
import AuthenticationSystem from '@/components/AuthenticationSystem';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Building, 
  ArrowRight, 
  Shield, 
  Clock, 
  MapPin, 
  Wifi, 
  ArrowLeft, 
  Home,
  Timer,
  CheckCircle2,
  Copy,
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const SFDSelector = () => {
  const [currentStep, setCurrentStep] = useState<'selection' | 'authentication' | 'verification' | 'confirmation'>('selection');
  const [selectedSFD, setSelectedSFD] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState<string>('');
  const [otpExpiry, setOtpExpiry] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationComplete, setVerificationComplete] = useState<boolean>(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const generateOTP = () => {
    const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpCode(newOtp);
    
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);
    setOtpExpiry(expiry);
  };

  useEffect(() => {
    if (!otpExpiry) return;

    const timer = setInterval(() => {
      const now = new Date();
      const diff = otpExpiry.getTime() - now.getTime();
      
      if (diff <= 0) {
        clearInterval(timer);
        setTimeRemaining(0);
        
        if (currentStep === 'verification' && !verificationComplete) {
          toast({
            title: "Code OTP expiré",
            description: "Un nouveau code a été généré",
            variant: "destructive",
          });
          generateOTP();
        }
      } else {
        setTimeRemaining(Math.floor(diff / 1000));
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [otpExpiry, currentStep, verificationComplete, toast]);

  const handleSFDSelection = (sfdName: string) => {
    setSelectedSFD(sfdName);
    setCurrentStep('authentication');
  };

  const handleAuthenticationComplete = () => {
    generateOTP();
    setCurrentStep('verification');
  };

  const handleVerifyOTP = () => {
    setIsVerifying(true);
    
    setTimeout(() => {
      setIsVerifying(false);
      setVerificationComplete(true);
      
      toast({
        title: "Vérification réussie",
        description: "Votre compte a été vérifié par l'agent SFD",
      });
      
      setTimeout(() => {
        setCurrentStep('confirmation');
      }, 1500);
    }, 2000);
  };

  const handleRegenerateOTP = () => {
    generateOTP();
    toast({
      title: "Nouveau code généré",
      description: "Veuillez partager ce code avec l'agent SFD",
    });
  };
  
  const handleCopyOTP = () => {
    navigator.clipboard.writeText(otpCode);
    toast({
      title: "Code copié",
      description: "Le code OTP a été copié dans le presse-papier",
    });
  };

  const handleConfirmSelection = () => {
    navigate('/mobile-flow');
  };

  const handleGoBack = () => {
    if (currentStep === 'authentication') {
      setCurrentStep('selection');
    } else if (currentStep === 'verification') {
      setCurrentStep('authentication');
    } else if (currentStep === 'confirmation') {
      setCurrentStep('verification');
    } else {
      navigate('/');
    }
  };

  const formatTimeRemaining = () => {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm p-3 z-10 shadow-sm flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleGoBack}
          className="mr-2 hover:bg-gray-100"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> 
          <span className="text-sm">Retour</span>
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/')}
          className="ml-auto hover:bg-gray-100"
        >
          <Home className="h-4 w-4 mr-1" /> 
          <span className="text-sm">Accueil</span>
        </Button>
      </div>
      
      <div className="container mx-auto p-4 pt-20 pb-16 max-w-lg">
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-block p-3 rounded-full bg-white shadow-sm mb-3">
            <img 
              src="/lovable-uploads/08a3f3d2-0612-4e7e-8248-5ba5eb3fce63.png" 
              alt="NGNA SÔRÔ! Logo" 
              className="h-14 w-auto"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold">
            <span className="text-[#FFAB2E]">N'GNA</span> <span className="text-[#0D6A51]">SÔRÔ!</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#0D6A51]/80 mb-2">MEREF - Système Financier Décentralisé</p>
          
          <Badge className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 py-0.5">Plateforme Multi-SFD</Badge>
        </div>

        <div className="flex justify-center items-center mb-6">
          <div className={`h-2 w-2 rounded-full ${currentStep === 'selection' ? 'bg-[#0D6A51]' : 'bg-gray-300'} mr-1`}></div>
          <div className={`h-0.5 w-4 ${currentStep !== 'selection' ? 'bg-[#0D6A51]' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-2 rounded-full ${currentStep === 'authentication' ? 'bg-[#0D6A51]' : 'bg-gray-300'} mr-1`}></div>
          <div className={`h-0.5 w-4 ${currentStep === 'verification' || currentStep === 'confirmation' ? 'bg-[#0D6A51]' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-2 rounded-full ${currentStep === 'verification' ? 'bg-[#0D6A51]' : 'bg-gray-300'} mr-1`}></div>
          <div className={`h-0.5 w-4 ${currentStep === 'confirmation' ? 'bg-[#0D6A51]' : 'bg-gray-300'}`}></div>
          <div className={`h-2 w-2 rounded-full ${currentStep === 'confirmation' ? 'bg-[#0D6A51]' : 'bg-gray-300'}`}></div>
        </div>

        <Card className="w-full mx-auto border-none shadow-lg rounded-xl overflow-hidden animate-scale-in">
          <CardHeader className="bg-gradient-to-r from-[#0D6A51]/5 to-[#FFAB2E]/5 pb-4">
            <CardTitle className="text-lg sm:text-xl text-[#0D6A51]">
              {currentStep === 'selection' && "Sélectionnez votre SFD"}
              {currentStep === 'authentication' && "Vérification d'identité"}
              {currentStep === 'verification' && "Validation par agent SFD"}
              {currentStep === 'confirmation' && "Confirmation d'inscription"}
            </CardTitle>
            <CardDescription>
              {currentStep === 'selection' && "Choisissez l'agence SFD la plus proche ou celle qui correspond à vos besoins"}
              {currentStep === 'authentication' && "Complétez la vérification biométrique pour finaliser votre inscription"}
              {currentStep === 'verification' && "Communiquez le code OTP à l'agent SFD pour valider votre compte"}
              {currentStep === 'confirmation' && "Vérifiez les détails de votre sélection avant de continuer"}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            {currentStep === 'selection' && (
              <div className="space-y-6">
                <GeoAgencySelector onSelectAgency={(agency) => handleSFDSelection(agency.name)} />
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                  <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 transition-transform hover:scale-102 hover:shadow-sm">
                    <h3 className="font-medium flex items-center text-blue-800">
                      <MapPin className="h-4 w-4 mr-2" />
                      Géolocalisation API
                    </h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Recherche dynamique des agences dans un rayon de 50km autour de votre position.
                    </p>
                  </div>
                  
                  <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 transition-transform hover:scale-102 hover:shadow-sm">
                    <h3 className="font-medium flex items-center text-amber-800">
                      <Wifi className="h-4 w-4 mr-2" />
                      Cache Redis Temps Réel
                    </h3>
                    <p className="text-sm text-amber-700 mt-1">
                      Les taux d'intérêt et offres spéciales sont spécifiques à chaque SFD et mis à jour en temps réel.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {currentStep === 'authentication' && (
              <div className="space-y-6">
                <Alert className="mb-4 bg-[#0D6A51]/5 border-[#0D6A51]/20 text-[#0D6A51]">
                  <Building className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Inscription en cours pour <strong>{selectedSFD}</strong>
                  </AlertDescription>
                </Alert>
                
                <div className="bg-green-50 border border-green-100 rounded-lg p-4 mb-4">
                  <h3 className="font-medium flex items-center text-green-800">
                    <Shield className="h-4 w-4 mr-2" />
                    Enregistrement Biométrique Facial
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Votre identité biométrique sera enregistrée dans la base de données de {selectedSFD} et partageable de manière sécurisée entre SFDs.
                  </p>
                </div>
                
                <AuthenticationSystem onComplete={handleAuthenticationComplete} />
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep('selection')} 
                    className="hover:bg-gray-50 transition-colors">
                    Retour
                  </Button>
                </div>
              </div>
            )}
            
            {currentStep === 'verification' && (
              <div className="space-y-6">
                <Alert className="mb-4 bg-[#0D6A51]/5 border-[#0D6A51]/20 text-[#0D6A51]">
                  <Building className="h-4 w-4 mr-2" />
                  <AlertDescription>
                    Validation en cours pour <strong>{selectedSFD}</strong>
                  </AlertDescription>
                </Alert>
                
                {!verificationComplete ? (
                  <div className="space-y-4">
                    <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
                      <h3 className="font-medium flex items-center text-amber-800">
                        <Timer className="h-4 w-4 mr-2" />
                        Validation par agent SFD requise
                      </h3>
                      <p className="text-sm text-amber-700 mt-1">
                        Veuillez communiquer ce code à l'agent SFD de votre agence pour valider votre compte.
                        Le code expirera dans <span className="font-medium">{formatTimeRemaining()}</span>.
                      </p>
                    </div>
                    
                    <div className="bg-white border rounded-lg p-6 text-center">
                      <p className="text-sm text-gray-500 mb-2">Votre code OTP</p>
                      <div className="flex justify-center mb-3">
                        <div className="bg-gray-50 text-2xl font-bold tracking-wider py-3 px-6 rounded-md border border-gray-200">
                          {otpCode.split('').map((digit, index) => (
                            <span key={index} className="inline-block w-6 mx-1">{digit}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleCopyOTP}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copier
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={handleRegenerateOTP}
                          className="text-xs"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Régénérer
                        </Button>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                      <p>
                        <strong>Attente de validation par l'agent</strong>
                      </p>
                      <p className="mt-1">
                        Une fois que l'agent SFD aura saisi ce code, votre compte sera automatiquement validé.
                        Vous pouvez également continuer le processus en appuyant sur le bouton ci-dessous.
                      </p>
                    </div>
                    
                    <Button 
                      className="w-full" 
                      onClick={handleVerifyOTP}
                      disabled={isVerifying}
                    >
                      {isVerifying ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Vérification en cours...
                        </>
                      ) : (
                        "Vérifier le statut de validation"
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="h-16 w-16 bg-green-100 text-green-600 rounded-full mx-auto flex items-center justify-center mb-4">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h3 className="text-lg font-medium text-green-800">Validation SFD réussie</h3>
                    <p className="text-sm text-green-700 mt-2 mb-6">
                      Votre compte a été vérifié avec succès par l'agent SFD
                    </p>
                    <Button 
                      onClick={() => setCurrentStep('confirmation')}
                      className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                    >
                      Continuer
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {currentStep === 'confirmation' && (
              <div className="space-y-6">
                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                  <h3 className="font-medium flex items-center text-green-800">
                    <Shield className="h-4 w-4 mr-2" />
                    Inscription validée
                  </h3>
                  <p className="text-sm text-green-700 mt-1">
                    Votre identité a été vérifiée et enregistrée dans la base de données de {selectedSFD}.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4 mt-4 bg-white shadow-sm">
                  <h3 className="font-medium text-[#0D6A51]">Détails de votre compte</h3>
                  <div className="mt-2 space-y-3">
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-sm text-muted-foreground">Institution</span>
                      <span className="font-medium">{selectedSFD}</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-sm text-muted-foreground">Type de compte</span>
                      <span className="font-medium">Compte d'épargne</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                      <span className="text-sm text-muted-foreground">Taux d'épargne</span>
                      <span className="font-medium text-green-600">3.5%</span>
                    </div>
                    <div className="flex justify-between items-center py-1.5">
                      <span className="text-sm text-muted-foreground">Frais mensuels</span>
                      <span className="font-medium text-green-600">0 FCFA</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between mt-6">
                  <Button variant="outline" onClick={() => setCurrentStep('authentication')}
                    className="hover:bg-gray-50 transition-colors">
                    Retour
                  </Button>
                  <Button onClick={handleConfirmSelection} 
                    className="bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-md hover:shadow-lg transition-all">
                    Finaliser l'inscription
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SFDSelector;
