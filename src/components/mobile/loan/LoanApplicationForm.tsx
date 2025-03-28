
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { 
  AmountDurationStep,
  PurposeStep, 
  AttachmentsStep,
  StepIndicator
} from './LoanApplicationSteps';

// Types
interface LoanFormData {
  amount: number;
  duration_months: number;
  purpose: string;
  sfd_id: string;
  attachments: string[];
  full_name: string;
}

// Service pour les demandes de prêt
const applyForLoan = async (loanData: LoanFormData) => {
  // Simulation d'une requête API
  return new Promise<{ success: boolean; message: string }>((resolve) => {
    setTimeout(() => {
      resolve({ 
        success: true, 
        message: "Votre demande de prêt a été soumise avec succès!" 
      });
    }, 2000);
  });
};

const LoanApplicationForm: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, activeSfdId } = useAuth();
  
  // Étape actuelle
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;
  
  // État du formulaire
  const [amount, setAmount] = useState<number>(0);
  const [durationMonths, setDurationMonths] = useState<number>(6);
  const [purpose, setPurpose] = useState<string>('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Validation par étape
  const isStep1Valid = amount >= 50000 && durationMonths > 0;
  const isStep2Valid = purpose.trim().length > 0;
  
  // Navigation entre les étapes
  const goToNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Soumission du formulaire
  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour soumettre une demande de prêt",
        variant: "destructive"
      });
      return;
    }
    
    if (!activeSfdId) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une SFD pour continuer",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Préparation des données
      const loanData: LoanFormData = {
        amount: amount,
        duration_months: durationMonths,
        purpose: purpose,
        sfd_id: activeSfdId,
        attachments: attachments,
        full_name: user.full_name || user.email
      };
      
      const result = await applyForLoan(loanData);
      
      if (result.success) {
        toast({
          title: "Succès!",
          description: result.message
        });
        
        // Redirection vers la page de suivi des prêts
        navigate('/mobile-flow/loan-tracking');
      } else {
        throw new Error(result.message);
      }
    } catch (error: any) {
      toast({
        title: "Erreur lors de la soumission",
        description: error.message || "Une erreur s'est produite, veuillez réessayer.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container max-w-md mx-auto px-4 py-6">
      <Button 
        variant="ghost" 
        className="mb-4" 
        onClick={() => navigate('/mobile-flow/main')}
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Retour
      </Button>
      
      <Card>
        <CardContent className="p-6">
          <StepIndicator currentStep={currentStep} totalSteps={totalSteps} />
          
          {currentStep === 1 && (
            <AmountDurationStep
              amount={amount}
              setAmount={setAmount}
              durationMonths={durationMonths}
              setDurationMonths={setDurationMonths}
              onNext={goToNextStep}
              isValid={isStep1Valid}
            />
          )}
          
          {currentStep === 2 && (
            <PurposeStep
              purpose={purpose}
              setPurpose={setPurpose}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              isValid={isStep2Valid}
            />
          )}
          
          {currentStep === 3 && (
            <AttachmentsStep
              attachments={attachments}
              setAttachments={setAttachments}
              onBack={goToPreviousStep}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LoanApplicationForm;
