
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ArrowRight, Volume2, VolumeX } from 'lucide-react';
import VoiceAssistant from '@/components/VoiceAssistant';
import { useToast } from '@/hooks/use-toast';
import { useLocalization } from '@/contexts/LocalizationContext';
import { LoanApplicationStep } from './types';
import { useStepConfig } from './StepConfig';
import LoanStepContent from './LoanStepContent';

const LoanApplicationFlow = () => {
  const { toast } = useToast();
  const { language, voiceOverEnabled, toggleVoiceOver } = useLocalization();
  const [currentStep, setCurrentStep] = useState<LoanApplicationStep>('start');
  const [loanPurpose, setLoanPurpose] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanDuration, setLoanDuration] = useState<string>('6');
  const [isLoading, setIsLoading] = useState(false);
  const [animateNext, setAnimateNext] = useState(false);
  const [currentVoiceMessage, setCurrentVoiceMessage] = useState<string>('');
  const contentRef = useRef<HTMLDivElement>(null);
  
  const stepConfig = useStepConfig(language);

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  useEffect(() => {
    // Update the current voice message when step changes
    setCurrentVoiceMessage(stepConfig[currentStep].voiceMessage);
  }, [currentStep, language, stepConfig]);

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

  return (
    <div className="container mx-auto max-w-md p-4 pb-20">
      <Card className="border-0 shadow-lg rounded-2xl overflow-hidden">
        <CardHeader className={`${currentStep === 'complete' ? 'bg-green-500' : 'bg-[#0D6A51]'} text-white`}>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              {stepConfig[currentStep].icon}
              {stepConfig[currentStep].title}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleVoiceOver}
                className="text-white hover:bg-white/20"
              >
                {voiceOverEnabled ? 
                  <Volume2 className="h-4 w-4" /> : 
                  <VolumeX className="h-4 w-4" />
                }
              </Button>
              <span className="text-xs bg-white/20 py-1 px-2 rounded-full">
                Étape {['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'].indexOf(currentStep) + 1} sur 7
              </span>
            </div>
          </div>
          <Progress 
            value={stepConfig[currentStep].progress} 
            className="h-1 mt-2 bg-white/20" 
          />
        </CardHeader>
        
        <CardContent className="p-5 overflow-y-auto max-h-[60vh]" ref={contentRef}>
          <div className={`transition-opacity duration-300 ${animateNext ? 'opacity-50' : 'opacity-100'}`}>
            <LoanStepContent
              currentStep={currentStep}
              loanPurpose={loanPurpose}
              setLoanPurpose={setLoanPurpose}
              loanAmount={loanAmount}
              setLoanAmount={setLoanAmount}
              loanDuration={loanDuration}
              setLoanDuration={setLoanDuration}
            />
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
      
      <div className="fixed bottom-24 right-4 z-50">
        <VoiceAssistant 
          message={currentVoiceMessage} 
          autoPlay={true}
          language={language === 'bambara' ? 'bambara' : 'french'}
        />
      </div>
    </div>
  );
};

export default LoanApplicationFlow;
