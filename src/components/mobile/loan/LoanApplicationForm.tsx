
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Upload, AlertCircle } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { mobileApi } from '@/utils/mobileApi';
import { useAuth } from '@/hooks/auth';

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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 50000,
      duration_months: 12,
      purpose: '',
      sfd_id: '',
    },
  });

  const totalSteps = 3;
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

  // Calcul de la mensualité (simplifié)
  const calculateMonthlyPayment = () => {
    const amount = form.getValues('amount');
    const duration = form.getValues('duration_months');
    const interestRate = 0.1; // 10% annuel simplifié
    
    // Formule simplifiée
    const monthlyRate = interestRate / 12;
    const payment = (amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -duration));
    
    return payment.toFixed(0);
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
        <div className="flex items-center justify-between mb-1">
          <div className="text-sm">Étape {step} sur {totalSteps}</div>
          <div className="text-sm font-medium">{Math.round((step / totalSteps) * 100)}%</div>
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#0D6A51] rounded-full transition-all duration-300" 
            style={{ width: `${(step / totalSteps) * 100}%` }}
          ></div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-xl font-semibold mb-2">Montant et durée</div>
              
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Montant du prêt (FCFA)</FormLabel>
                    <div className="mb-2">
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </div>
                    <Slider
                      min={10000}
                      max={1000000}
                      step={5000}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>10 000</span>
                      <span>1 000 000</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="duration_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Durée (mois)</FormLabel>
                    <div className="mb-2">
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value))}
                      />
                    </div>
                    <Slider
                      min={1}
                      max={36}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>1 mois</span>
                      <span>36 mois</span>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Card className="p-4 bg-gray-50">
                <div className="font-semibold text-sm mb-2">Estimation mensuelle</div>
                <div className="text-2xl font-bold">{calculateMonthlyPayment()} FCFA</div>
                <div className="text-xs text-gray-500 mt-1">
                  *Taux d'intérêt estimé à 10% annuel
                </div>
              </Card>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-xl font-semibold mb-2">Objet du prêt</div>
              
              <FormField
                control={form.control}
                name="sfd_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Institution financière</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un SFD" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sfd-1">Microfinance Alpha</SelectItem>
                        <SelectItem value="sfd-2">Crédit Rural</SelectItem>
                        <SelectItem value="sfd-3">Finance Solidaire</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="purpose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Objet du prêt</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Décrivez l'objet de votre demande de prêt" 
                        className="resize-none h-32"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="text-xl font-semibold mb-2">Pièces justificatives</div>
              
              <div className="border-2 border-dashed rounded-lg p-4 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-2">Glissez-déposez ou cliquez pour ajouter</p>
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  Parcourir
                </Button>
              </div>
              
              {attachments.length > 0 && (
                <div className="border rounded-lg divide-y">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3">
                      <div className="flex items-center">
                        <div className="bg-gray-100 p-1.5 rounded">
                          <Upload className="h-4 w-4 text-gray-500" />
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium truncate max-w-[200px]">{file.name}</p>
                          <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Supprimer
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mr-2 mt-0.5 shrink-0" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold">Important</p>
                  <p>Toutes les pièces justificatives doivent être lisibles et valides. Des documents incomplets peuvent retarder le traitement de votre demande.</p>
                </div>
              </div>
              
              <div className="pt-4">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Traitement en cours...' : 'Soumettre ma demande'}
                </Button>
              </div>
            </div>
          )}
          
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
