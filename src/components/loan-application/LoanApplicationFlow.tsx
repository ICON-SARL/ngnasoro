
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ArrowUpCircle, Coins, Clock, MapPin, ClipboardCheck, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSynchronization } from '@/hooks/useRealtimeSynchronization';
import { LoanApplicationStep, StepConfig } from './types';

// Step components
import StepStart from './StepStart';
import StepPurpose from './StepPurpose';
import StepAmount from './StepAmount';
import StepDuration from './StepDuration';
import StepLocation from './StepLocation';
import StepReview from './StepReview';
import StepComplete from './StepComplete';

// Voice interaction components
import VoiceUI from '../VoiceUI';

const LoanApplicationFlow: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { activeSfdId } = useAuth();
  const [currentStep, setCurrentStep] = useState<LoanApplicationStep>('start');
  const [loanPurpose, setLoanPurpose] = useState('');
  const [loanAmount, setLoanAmount] = useState('');
  const [loanDuration, setLoanDuration] = useState('');
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const { synchronizeWithSfd } = useRealtimeSynchronization();

  // Effet pour synchroniser les données au démarrage du flux de prêt
  useEffect(() => {
    if (activeSfdId) {
      // Synchroniser les données avec la SFD au démarrage du flux
      synchronizeWithSfd().catch(err => {
        console.error('Error synchronizing with SFD:', err);
      });
    }
  }, [activeSfdId, synchronizeWithSfd]);

  const stepConfigs: Record<LoanApplicationStep, StepConfig> = {
    start: {
      title: 'Demande de prêt',
      voiceMessage: 'Bienvenue dans l\'assistant de prêt. Je vais vous guider étape par étape.',
      nextLabel: 'Commencer',
      icon: <CreditCard className="h-6 w-6 text-[#0D6A51]" />,
      progress: 0
    },
    purpose: {
      title: 'Objectif du prêt',
      voiceMessage: 'Quel est l\'objectif de votre prêt?',
      nextLabel: 'Continuer',
      prevLabel: 'Retour',
      icon: <ArrowUpCircle className="h-6 w-6 text-[#0D6A51]" />,
      progress: 20
    },
    amount: {
      title: 'Montant du prêt',
      voiceMessage: 'Quel montant souhaitez-vous emprunter?',
      nextLabel: 'Continuer',
      prevLabel: 'Retour',
      icon: <Coins className="h-6 w-6 text-[#0D6A51]" />,
      progress: 40
    },
    duration: {
      title: 'Durée du prêt',
      voiceMessage: 'Sur quelle durée souhaitez-vous rembourser ce prêt?',
      nextLabel: 'Continuer',
      prevLabel: 'Retour',
      icon: <Clock className="h-6 w-6 text-[#0D6A51]" />,
      progress: 60
    },
    location: {
      title: 'Agence SFD',
      voiceMessage: 'Veuillez sélectionner l\'agence SFD la plus proche de chez vous.',
      nextLabel: 'Continuer',
      prevLabel: 'Retour',
      icon: <MapPin className="h-6 w-6 text-[#0D6A51]" />,
      progress: 80
    },
    review: {
      title: 'Vérification',
      voiceMessage: 'Veuillez vérifier les détails de votre demande avant de soumettre.',
      nextLabel: 'Soumettre',
      prevLabel: 'Retour',
      icon: <ClipboardCheck className="h-6 w-6 text-[#0D6A51]" />,
      progress: 90
    },
    complete: {
      title: 'Demande envoyée',
      voiceMessage: 'Félicitations! Votre demande a été soumise avec succès.',
      nextLabel: 'Terminer',
      icon: <Check className="h-6 w-6 text-[#0D6A51]" />,
      progress: 100
    }
  };

  const handleNext = () => {
    const steps: LoanApplicationStep[] = ['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    } else {
      // Dernière étape complétée
      navigate('/mobile-flow/main');
      
      // Synchroniser à nouveau avec la SFD après avoir complété le prêt
      synchronizeWithSfd().catch(err => {
        console.error('Error synchronizing with SFD after loan completion:', err);
      });
      
      toast({
        title: "Demande complétée",
        description: "Votre demande de prêt a été enregistrée avec succès.",
      });
    }
  };

  const handlePrevious = () => {
    const steps: LoanApplicationStep[] = ['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const toggleVoiceUI = () => {
    setVoiceEnabled(!voiceEnabled);
  };

  // Rendu du contenu actuel de l'étape
  const renderStepContent = () => {
    switch (currentStep) {
      case 'start':
        return <StepStart />;
      case 'purpose':
        return <StepPurpose purpose={loanPurpose} setPurpose={setLoanPurpose} />;
      case 'amount':
        return <StepAmount amount={loanAmount} setAmount={setLoanAmount} />;
      case 'duration':
        return <StepDuration duration={loanDuration} setDuration={setLoanDuration} />;
      case 'location':
        return <StepLocation />;
      case 'review':
        return (
          <StepReview 
            purpose={loanPurpose}
            amount={loanAmount}
            duration={loanDuration}
          />
        );
      case 'complete':
        return <StepComplete loanAmount={loanAmount} />;
      default:
        return <div>Étape inconnue</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <button 
              onClick={handlePrevious} 
              className={`mr-3 ${currentStep === 'start' ? 'invisible' : 'visible'}`}
              aria-label="Étape précédente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
            </button>
            <div>
              <h1 className="text-lg font-bold flex items-center">
                {stepConfigs[currentStep].icon}
                <span className="ml-2">{stepConfigs[currentStep].title}</span>
              </h1>
            </div>
          </div>
          
          <button 
            onClick={toggleVoiceUI}
            className={`p-2 rounded-full ${voiceEnabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
            aria-label="Activer/désactiver l'assistance vocale"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Barre de progression */}
        <div className="h-2 w-full bg-gray-200 rounded-full mb-6">
          <div 
            className="h-2 bg-[#0D6A51] rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${stepConfigs[currentStep].progress}%` }}
          ></div>
        </div>

        {/* Contenu de l'étape */}
        <Card className="shadow-md">
          <CardContent className="p-6">
            {renderStepContent()}
            
            {/* Boutons de navigation */}
            <div className="flex justify-between mt-8">
              {currentStep !== 'start' && currentStep !== 'complete' && (
                <Button 
                  variant="outline" 
                  onClick={handlePrevious}
                >
                  {stepConfigs[currentStep].prevLabel}
                </Button>
              )}
              <div className={`${currentStep !== 'start' && currentStep !== 'complete' ? 'ml-auto' : 'mx-auto'}`}>
                <Button 
                  onClick={handleNext}
                  className="bg-[#0D6A51] hover:bg-[#0D6A51]/90"
                >
                  {stepConfigs[currentStep].nextLabel}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interface vocale */}
      {voiceEnabled && (
        <VoiceUI 
          message={stepConfigs[currentStep].voiceMessage}
          onNextStep={handleNext}
          onPreviousStep={handlePrevious}
        />
      )}
    </div>
  );
};

export default LoanApplicationFlow;
