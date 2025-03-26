import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { CheckCircle2, ArrowRight, Landmark, Calendar, CreditCard, User, Home, ShoppingBag, BadgeEuro, ShieldCheck, Wallet, Info } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import GeoAgencySelector from './GeoAgencySelector';
import IconographicUI from './IconographicUI';
import RealTimeSavingsWidget from './RealTimeSavingsWidget';
import { useToast } from '@/components/ui/use-toast';

type LoanApplicationStep = 'start' | 'purpose' | 'amount' | 'duration' | 'location' | 'review' | 'complete';

interface StepConfig {
  title: string;
  voiceMessage: string;
  nextLabel: string;
  prevLabel?: string;
  icon: React.ReactNode;
  progress: number;
}

interface PurposeOption {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const LoanApplicationFlow = () => {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<LoanApplicationStep>('start');
  const [loanPurpose, setLoanPurpose] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanDuration, setLoanDuration] = useState<string>('6');
  const [isLoading, setIsLoading] = useState(false);
  const [animateNext, setAnimateNext] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const purposeOptions: PurposeOption[] = [
    { id: 'agriculture', name: 'Agriculture', icon: <ShoppingBag className="h-6 w-6 mb-2 text-green-500" />, description: "Financement agricole" },
    { id: 'commerce', name: 'Commerce', icon: <BadgeEuro className="h-6 w-6 mb-2 text-blue-500" />, description: "Développement commercial" },
    { id: 'education', name: 'Éducation', icon: <User className="h-6 w-6 mb-2 text-purple-500" />, description: "Frais de scolarité" },
    { id: 'sante', name: 'Santé', icon: <ShieldCheck className="h-6 w-6 mb-2 text-red-500" />, description: "Dépenses médicales" },
    { id: 'logement', name: 'Logement', icon: <Home className="h-6 w-6 mb-2 text-amber-500" />, description: "Amélioration habitat" },
    { id: 'autre', name: 'Autre', icon: <Wallet className="h-6 w-6 mb-2 text-gray-500" />, description: "Autre besoin" },
  ];
  
  const stepConfig: Record<LoanApplicationStep, StepConfig> = {
    start: {
      title: "Demande de prêt",
      voiceMessage: "Bienvenue dans l'assistant de demande de prêt. Appuyez sur commencer pour débuter votre demande.",
      nextLabel: "Commencer",
      icon: <CreditCard className="h-6 w-6" />,
      progress: 0
    },
    purpose: {
      title: "Objet du prêt",
      voiceMessage: "Veuillez sélectionner l'objet de votre prêt. Pour quoi souhaitez-vous emprunter?",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Landmark className="h-6 w-6" />,
      progress: 20
    },
    amount: {
      title: "Montant du prêt",
      voiceMessage: "Entrez le montant que vous souhaitez emprunter.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <CreditCard className="h-6 w-6" />,
      progress: 40
    },
    duration: {
      title: "Durée du prêt",
      voiceMessage: "Sélectionnez la durée de remboursement de votre prêt.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Calendar className="h-6 w-6" />,
      progress: 60
    },
    location: {
      title: "Agence SFD",
      voiceMessage: "Sélectionnez l'agence SFD la plus proche de vous pour le traitement de votre demande.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Landmark className="h-6 w-6" />,
      progress: 80
    },
    review: {
      title: "Récapitulatif",
      voiceMessage: "Vérifiez les détails de votre demande de prêt avant de soumettre.",
      nextLabel: "Soumettre",
      prevLabel: "Retour",
      icon: <CheckCircle2 className="h-6 w-6" />,
      progress: 90
    },
    complete: {
      title: "Demande envoyée",
      voiceMessage: "Félicitations! Votre demande de prêt a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.",
      nextLabel: "Terminer",
      icon: <CheckCircle2 className="h-6 w-6" />,
      progress: 100
    }
  };

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleNext = () => {
    setAnimateNext(true);
    setIsLoading(true);
    
    setTimeout(() => {
      const stepOrder: LoanApplicationStep[] = ['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'];
      const currentIndex = stepOrder.indexOf(currentStep);
      
      if (currentIndex < stepOrder.length - 1) {
        setCurrentStep(stepOrder[currentIndex + 1]);
      }
      
      setIsLoading(false);
      setAnimateNext(false);
      
      if (currentStep === 'review') {
        toast({
          title: "Demande envoyée avec succès",
          description: "Votre demande sera traitée dans les 48 heures",
        });
      }
    }, 800);
  };

  const handlePrevious = () => {
    const stepOrder: LoanApplicationStep[] = ['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(stepOrder[currentIndex - 1]);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'start':
        return (
          <div className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <div className="w-24 h-24 rounded-full bg-[#0D6A51]/10 flex items-center justify-center mb-4">
                <CreditCard className="h-12 w-12 text-[#0D6A51]" />
              </div>
              <h3 className="text-xl font-bold text-center">Bienvenue dans l'assistant de prêt</h3>
              <p className="text-gray-500 text-center mt-2">
                Obtenez un prêt en quelques étapes simples avec votre compte SFD
              </p>
            </div>
            
            <IconographicUI />
            <div className="mt-6">
              <RealTimeSavingsWidget />
            </div>
          </div>
        );
      
      case 'purpose':
        return (
          <div className="space-y-4">
            <Label htmlFor="purpose" className="text-lg font-medium">Objet du prêt</Label>
            <p className="text-sm text-gray-500 mb-3">Sélectionnez la raison principale pour laquelle vous avez besoin de ce financement</p>
            
            <div className="grid grid-cols-2 gap-3">
              {purposeOptions.map(option => (
                <Button
                  key={option.id}
                  variant={loanPurpose === option.id ? "default" : "outline"}
                  className={`h-auto py-4 px-3 flex flex-col gap-1 justify-center items-center transition-all ${
                    loanPurpose === option.id 
                      ? 'bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-md scale-105' 
                      : 'hover:border-[#0D6A51]/40 hover:bg-[#0D6A51]/5'
                  }`}
                  onClick={() => setLoanPurpose(option.id)}
                >
                  {option.icon}
                  <span className="font-medium">{option.name}</span>
                  <span className="text-xs opacity-80">{option.description}</span>
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 'amount':
        return (
          <div className="space-y-4">
            <Label htmlFor="amount" className="text-lg font-medium">Montant du prêt</Label>
            <p className="text-sm text-gray-500 mb-3">Saisissez ou sélectionnez le montant dont vous avez besoin</p>
            
            <div className="bg-[#0D6A51]/5 p-4 rounded-xl mb-4">
              <Input
                id="amount"
                type="number"
                placeholder="50000"
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="text-2xl py-6 text-center font-bold border-0 bg-white shadow focus-visible:ring-[#0D6A51]"
              />
              <p className="text-xs text-center mt-2 text-gray-500">FCFA</p>
            </div>
            
            <Label className="text-sm">Montants suggérés</Label>
            <div className="grid grid-cols-2 gap-3">
              {[50000, 100000, 250000, 500000].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setLoanAmount(amount.toString())}
                  className={`flex-1 hover:border-[#0D6A51]/40 hover:bg-[#0D6A51]/5 ${
                    parseInt(loanAmount) === amount ? 'border-[#0D6A51] bg-[#0D6A51]/10' : ''
                  }`}
                >
                  {amount.toLocaleString('fr-FR')}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 'duration':
        return (
          <div className="space-y-4">
            <Label htmlFor="duration" className="text-lg font-medium">Durée du prêt</Label>
            <p className="text-sm text-gray-500 mb-3">Sélectionnez la durée de remboursement qui vous convient</p>
            
            <div className="grid grid-cols-3 gap-3">
              {[3, 6, 12, 18, 24, 36].map(months => (
                <Button
                  key={months}
                  variant={loanDuration === months.toString() ? "default" : "outline"}
                  className={`h-auto py-4 transition-all ${
                    loanDuration === months.toString() 
                      ? 'bg-[#0D6A51] hover:bg-[#0D6A51]/90 text-white shadow-md scale-105' 
                      : 'hover:border-[#0D6A51]/40 hover:bg-[#0D6A51]/5'
                  }`}
                  onClick={() => setLoanDuration(months.toString())}
                >
                  <div className="flex flex-col">
                    <span className="text-lg font-bold">{months}</span>
                    <span className="text-xs">mois</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <div className="mt-4 bg-blue-50 p-3 rounded-xl">
              <div className="flex items-center">
                <Info className="h-5 w-5 text-blue-500 mr-2" />
                <p className="text-sm text-blue-600">
                  Mensualité estimée: {(parseInt(loanAmount || '0') / parseInt(loanDuration || '1') * 1.055).toFixed(0)} FCFA
                </p>
              </div>
            </div>
          </div>
        );
      
      case 'location':
        return (
          <div className="space-y-4">
            <Label className="text-lg font-medium">Agence SFD</Label>
            <p className="text-sm text-gray-500 mb-3">Sélectionnez l'agence la plus proche pour votre demande</p>
            <GeoAgencySelector />
          </div>
        );
      
      case 'review':
        return (
          <div className="space-y-5">
            <Card className="border shadow-sm rounded-xl overflow-hidden">
              <CardHeader className="bg-[#0D6A51]/10 py-3 px-4">
                <CardTitle className="text-sm font-medium text-[#0D6A51]">Récapitulatif de votre demande</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <div className="flex items-center">
                      {purposeOptions.find(p => p.id === loanPurpose)?.icon || <Landmark className="h-5 w-5 mr-2 text-[#0D6A51]" />}
                      <span className="text-gray-600 ml-2">Objet</span>
                    </div>
                    <span className="font-medium">{purposeOptions.find(p => p.id === loanPurpose)?.name || loanPurpose}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <div className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2 text-[#0D6A51]" />
                      <span className="text-gray-600">Montant</span>
                    </div>
                    <span className="font-medium">{parseInt(loanAmount).toLocaleString('fr-FR')} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-[#0D6A51]" />
                      <span className="text-gray-600">Durée</span>
                    </div>
                    <span className="font-medium">{loanDuration} mois</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-dashed border-gray-200">
                    <div className="flex items-center">
                      <Landmark className="h-5 w-5 mr-2 text-[#0D6A51]" />
                      <span className="text-gray-600">Agence</span>
                    </div>
                    <span className="font-medium">Agence Centrale Bamako</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl shadow-sm overflow-hidden">
              <CardContent className="p-4">
                <h3 className="font-medium mb-3">Conditions du prêt</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Taux d'intérêt</span>
                    <span className="font-medium">5.5% par an</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Mensualité estimée</span>
                    <span className="font-medium">{(parseInt(loanAmount || '0') / parseInt(loanDuration || '1') * 1.055).toFixed(0)} FCFA</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Frais de dossier</span>
                    <span className="font-medium">2,000 FCFA</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span className="text-gray-600">Total à rembourser</span>
                    <span className="font-medium font-bold">{(parseInt(loanAmount || '0') * 1.055 + 2000).toFixed(0)} FCFA</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );
      
      case 'complete':
        return (
          <div className="text-center space-y-6 py-4">
            <div className="relative mx-auto">
              <div className="animate-pulse bg-green-100 dark:bg-green-900/20 rounded-full p-6 inline-block mx-auto">
                <CheckCircle2 className="h-20 w-20 text-green-600 dark:text-green-400" />
              </div>
              <div className="absolute top-0 right-0 animate-bounce">
                <div className="bg-yellow-400 rounded-full p-2">
                  <span className="text-white text-xs font-bold">✓</span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Demande envoyée avec succès!</h3>
              <p className="text-gray-600 mb-4">
                Votre demande de prêt de {parseInt(loanAmount).toLocaleString('fr-FR')} FCFA a été soumise.
                Vous recevrez une notification dans les 48 heures.
              </p>
              
              <div className="bg-blue-50 p-4 rounded-xl text-left">
                <h4 className="font-medium text-blue-700 mb-2">Prochaines étapes</h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-600">
                  <li>Vérification de votre demande (24-48h)</li>
                  <li>Notification par SMS d'approbation</li>
                  <li>Signature électronique des documents</li>
                  <li>Déblocage des fonds</li>
                </ol>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4 pb-20">
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className={`${currentStep === 'complete' ? 'bg-green-500' : 'bg-[#0D6A51]'} text-white`}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {stepConfig[currentStep].icon}
              {stepConfig[currentStep].title}
            </CardTitle>
            <span className="text-xs bg-white/20 py-1 px-2 rounded-full">
              Étape {['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'].indexOf(currentStep) + 1} sur 7
            </span>
          </div>
          <Progress 
            value={stepConfig[currentStep].progress} 
            className="h-1 mt-2 bg-white/20" 
          />
        </CardHeader>
        
        <CardContent className="p-5 overflow-y-auto max-h-[60vh]" ref={contentRef}>
          <div className={`transition-opacity duration-300 ${animateNext ? 'opacity-50' : 'opacity-100'}`}>
            {renderStepContent()}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between p-4 border-t">
          {stepConfig[currentStep].prevLabel && (
            <Button 
              variant="outline" 
              onClick={handlePrevious} 
              disabled={isLoading}
              className="w-1/3"
            >
              {stepConfig[currentStep].prevLabel}
            </Button>
          )}
          
          {!stepConfig[currentStep].prevLabel && <div className="w-1/3" />}
          
          <Button 
            onClick={handleNext} 
            className={`gap-2 w-2/3 ${currentStep === 'complete' ? 'bg-green-500 hover:bg-green-600' : 'bg-[#0D6A51] hover:bg-[#0D6A51]/90'}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="mr-2">Chargement...</span>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </>
            ) : (
              <>
                {stepConfig[currentStep].nextLabel}
                {currentStep !== 'complete' && <ArrowRight className="h-4 w-4" />}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
      
      <VoiceAssistant 
        message={stepConfig[currentStep].voiceMessage} 
        autoPlay={true}
        language="bambara"
      />
    </div>
  );
};

export default LoanApplicationFlow;
