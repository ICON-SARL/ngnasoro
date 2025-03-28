
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import { mobileApi } from '@/utils/mobileApi';
import { useAuth } from '@/hooks/auth';

// Importation des étapes du formulaire
import StepIndicator from './LoanApplicationSteps/StepIndicator';
import AmountDurationStep from './LoanApplicationSteps/AmountDurationStep';
import PurposeStep from './LoanApplicationSteps/PurposeStep';
import AttachmentsStep from './LoanApplicationSteps/AttachmentsStep';

// Schéma de validation du formulaire
const formSchema = z.object({
  amount: z.number().min(10000, 'Le montant minimum est de 10 000 FCFA').max(1000000, 'Le montant maximum est de 1 000 000 FCFA'),
  duration_months: z.number().min(1, 'La durée minimum est de 1 mois').max(36, 'La durée maximum est de 36 mois'),
  purpose: z.string().min(10, 'Veuillez décrire l\'objet du prêt (10 caractères minimum)'),
  sfd_id: z.string().min(1, 'Veuillez sélectionner un SFD'),
});

type FormValues = z.infer<typeof formSchema>;

const LoanApplicationForm: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user } = useAuth();
  const totalSteps = 3;

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 50000,
      duration_months: 12,
      purpose: '',
      sfd_id: '',
    },
  });

  const handleNext = () => {
    // Validation du formulaire par étape
    if (step === 1) {
      // Vérifier les champs de l'étape 1
      const { amount, duration_months } = form.getValues();
      if (!amount || !duration_months) {
        toast({
          title: 'Informations manquantes',
          description: 'Veuillez remplir tous les champs requis',
          variant: 'destructive',
        });
        return;
      }
    } else if (step === 2) {
      // Vérifier les champs de l'étape 2
      const { purpose, sfd_id } = form.getValues();
      if (!purpose || !sfd_id) {
        toast({
          title: 'Informations manquantes',
          description: 'Veuillez remplir tous les champs requis',
          variant: 'destructive',
        });
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate('/mobile-flow/main');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Convertir FileList en Array et ajouter à l'état
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      // Convertir les pièces jointes en base64 si nécessaire
      const attachmentBase64: string[] = [];
      
      // Cette version simplifie en n'uploadant pas réellement les fichiers
      // Dans une implémentation complète, il faudrait gérer l'upload des fichiers
      
      const loanData = {
        amount: data.amount,
        duration_months: data.duration_months,
        purpose: data.purpose,
        sfd_id: data.sfd_id,
        attachments: attachmentBase64,
        full_name: user?.user_metadata?.full_name || '',
      };
      
      const result = await mobileApi.applyForLoan(loanData);
      
      if (result) {
        toast({
          title: 'Demande soumise avec succès',
          description: 'Votre demande de prêt a été enregistrée',
        });
        navigate('/mobile-flow/loan-activity');
      }
    } catch (error) {
      console.error('Erreur lors de la soumission de la demande:', error);
      toast({
        title: 'Erreur',
        description: 'Une erreur est survenue lors de la soumission de votre demande',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu du formulaire en fonction de l'étape
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <AmountDurationStep form={form} />;
      case 2:
        return <PurposeStep form={form} />;
      case 3:
        return (
          <AttachmentsStep 
            attachments={attachments}
            handleFileChange={handleFileChange}
            removeAttachment={removeAttachment}
            isSubmitting={isSubmitting}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-md">
      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4" 
        onClick={handlePrevious}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Retour
      </Button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Demande de prêt</h1>
        <StepIndicator currentStep={step} totalSteps={totalSteps} />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {renderStepContent()}
          
          {step < totalSteps && (
            <div className="pt-4">
              <Button
                type="button"
                className="w-full"
                onClick={handleNext}
              >
                Continuer
              </Button>
            </div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default LoanApplicationForm;
