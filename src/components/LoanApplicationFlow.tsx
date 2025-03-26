
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CheckCircle2, ArrowRight, Landmark, Calendar, CreditCard } from 'lucide-react';
import VoiceAssistant from './VoiceAssistant';
import GeoAgencySelector from './GeoAgencySelector';
import IconographicUI from './IconographicUI';
import RealTimeSavingsWidget from './RealTimeSavingsWidget';

type LoanApplicationStep = 'start' | 'purpose' | 'amount' | 'duration' | 'location' | 'review' | 'complete';

interface StepConfig {
  title: string;
  voiceMessage: string;
  nextLabel: string;
  prevLabel?: string;
  icon: React.ReactNode;
}

const LoanApplicationFlow = () => {
  const [currentStep, setCurrentStep] = useState<LoanApplicationStep>('start');
  const [loanPurpose, setLoanPurpose] = useState<string>('');
  const [loanAmount, setLoanAmount] = useState<string>('');
  const [loanDuration, setLoanDuration] = useState<string>('6');

  const stepConfig: Record<LoanApplicationStep, StepConfig> = {
    start: {
      title: "Demande de prêt",
      voiceMessage: "Bienvenue dans l'assistant de demande de prêt. Appuyez sur commencer pour débuter votre demande.",
      nextLabel: "Commencer",
      icon: <CreditCard className="h-6 w-6" />
    },
    purpose: {
      title: "Objet du prêt",
      voiceMessage: "Veuillez sélectionner l'objet de votre prêt. Pour quoi souhaitez-vous emprunter?",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Landmark className="h-6 w-6" />
    },
    amount: {
      title: "Montant du prêt",
      voiceMessage: "Entrez le montant que vous souhaitez emprunter.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <CreditCard className="h-6 w-6" />
    },
    duration: {
      title: "Durée du prêt",
      voiceMessage: "Sélectionnez la durée de remboursement de votre prêt.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Calendar className="h-6 w-6" />
    },
    location: {
      title: "Agence SFD",
      voiceMessage: "Sélectionnez l'agence SFD la plus proche de vous pour le traitement de votre demande.",
      nextLabel: "Continuer",
      prevLabel: "Retour",
      icon: <Landmark className="h-6 w-6" />
    },
    review: {
      title: "Récapitulatif",
      voiceMessage: "Vérifiez les détails de votre demande de prêt avant de soumettre.",
      nextLabel: "Soumettre",
      prevLabel: "Retour",
      icon: <CheckCircle2 className="h-6 w-6" />
    },
    complete: {
      title: "Demande envoyée",
      voiceMessage: "Félicitations! Votre demande de prêt a été envoyée avec succès. Vous recevrez une notification dès qu'elle sera traitée.",
      nextLabel: "Terminer",
      icon: <CheckCircle2 className="h-6 w-6" />
    }
  };

  const handleNext = () => {
    const stepOrder: LoanApplicationStep[] = ['start', 'purpose', 'amount', 'duration', 'location', 'review', 'complete'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      setCurrentStep(stepOrder[currentIndex + 1]);
    }
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
            <IconographicUI />
            <div className="mt-6">
              <RealTimeSavingsWidget />
            </div>
          </div>
        );
      
      case 'purpose':
        return (
          <div className="space-y-4">
            <Label htmlFor="purpose">Objet du prêt</Label>
            <div className="grid grid-cols-2 gap-3">
              {['Agriculture', 'Commerce', 'Éducation', 'Santé', 'Logement', 'Autre'].map(purpose => (
                <Button
                  key={purpose}
                  variant={loanPurpose === purpose ? "default" : "outline"}
                  className="h-auto py-6 flex flex-col gap-2 justify-center items-center"
                  onClick={() => setLoanPurpose(purpose)}
                >
                  {purpose}
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 'amount':
        return (
          <div className="space-y-4">
            <Label htmlFor="amount">Montant (XOF)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="50000"
              value={loanAmount}
              onChange={(e) => setLoanAmount(e.target.value)}
              className="text-xl py-6"
            />
            <div className="flex justify-between">
              {[50000, 100000, 250000, 500000].map(amount => (
                <Button
                  key={amount}
                  variant="outline"
                  onClick={() => setLoanAmount(amount.toString())}
                  className="flex-1 mx-1"
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
            <Label htmlFor="duration">Durée (mois)</Label>
            <div className="grid grid-cols-3 gap-3">
              {[3, 6, 12, 18, 24, 36].map(months => (
                <Button
                  key={months}
                  variant={loanDuration === months.toString() ? "default" : "outline"}
                  className="h-auto py-6"
                  onClick={() => setLoanDuration(months.toString())}
                >
                  {months} mois
                </Button>
              ))}
            </div>
          </div>
        );
      
      case 'location':
        return <GeoAgencySelector />;
      
      case 'review':
        return (
          <div className="space-y-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Objet:</span>
                  <span className="font-medium">{loanPurpose}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Montant:</span>
                  <span className="font-medium">{parseInt(loanAmount).toLocaleString('fr-FR')} XOF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Durée:</span>
                  <span className="font-medium">{loanDuration} mois</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Agence:</span>
                  <span className="font-medium">Agence Centrale Bamako</span>
                </div>
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <h3 className="font-medium mb-2">Conditions du prêt</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Taux d'intérêt:</span>
                  <span>5% par an</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mensualité estimée:</span>
                  <span>{(parseInt(loanAmount) / parseInt(loanDuration) * 1.05).toFixed(0)} XOF</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Frais de dossier:</span>
                  <span>2,000 XOF</span>
                </div>
              </div>
            </div>
          </div>
        );
      
      case 'complete':
        return (
          <div className="text-center space-y-4">
            <div className="bg-green-100 dark:bg-green-900/20 rounded-full p-4 inline-block mx-auto">
              <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold">Demande envoyée avec succès!</h3>
            <p className="text-muted-foreground">
              Votre demande de prêt de {parseInt(loanAmount).toLocaleString('fr-FR')} XOF a été soumise.
              Vous recevrez une notification dans les 48 heures.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container mx-auto max-w-md p-4 pb-20">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {stepConfig[currentStep].icon}
            {stepConfig[currentStep].title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {renderStepContent()}
        </CardContent>
        
        <CardFooter className="flex justify-between">
          {stepConfig[currentStep].prevLabel && (
            <Button variant="outline" onClick={handlePrevious}>
              {stepConfig[currentStep].prevLabel}
            </Button>
          )}
          
          <div className="flex-1" />
          
          <Button onClick={handleNext} className="gap-2">
            {stepConfig[currentStep].nextLabel}
            {currentStep !== 'complete' && <ArrowRight className="h-4 w-4" />}
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
